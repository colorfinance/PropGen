-- AutoPost initial schema (Step 1 of 10)
-- Single-tenant in v1: all access via service_role. Multi-tenant RLS in v2.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================================================
-- updated_at trigger function
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- accounts
--   A brand/persona that AutoPost manages (e.g. "Local Theory").
-- ============================================================================
create table public.accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'Australia/Darwin',
  voice_profile jsonb not null default '{}'::jsonb,
  pillars jsonb not null default '[]'::jsonb,
  auto_mode boolean not null default false,
  posting_window jsonb not null default '{"start_hour": 8, "end_hour": 21}'::jsonb,
  daily_post_cap integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- ============================================================================
-- platform_connections
--   OAuth/API connection from an account to a social platform.
--   oauth_token_encrypted holds the UUID of a Supabase Vault secret (see 0002).
-- ============================================================================
create table public.platform_connections (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  platform text not null check (platform in ('x', 'instagram')),
  external_account_id text not null,
  external_handle text,
  oauth_token_encrypted uuid,
  oauth_refresh_token_encrypted uuid,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, platform, external_account_id)
);

create trigger platform_connections_set_updated_at
before update on public.platform_connections
for each row execute function public.set_updated_at();

create index platform_connections_account_id_idx
  on public.platform_connections (account_id);

-- ============================================================================
-- ingested_items
--   Raw source material harvested from RSS, scrapers, manual upload, etc.
--   pillar_scores is { pillar_name: score 0..1 } used for retrieval.
-- ============================================================================
create table public.ingested_items (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  source_type text not null,
  source_url text,
  title text,
  body text,
  raw jsonb not null default '{}'::jsonb,
  pillar_scores jsonb not null default '{}'::jsonb,
  used_in_post_id uuid,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ingested_items_set_updated_at
before update on public.ingested_items
for each row execute function public.set_updated_at();

create index ingested_items_unused_idx
  on public.ingested_items (account_id, fetched_at desc)
  where used_in_post_id is null;

create index ingested_items_pillar_scores_gin
  on public.ingested_items using gin (pillar_scores);

-- ============================================================================
-- drafts
--   AI-generated post drafts pending approval/scheduling.
-- ============================================================================
create table public.drafts (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  platform text not null check (platform in ('x', 'instagram')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'published', 'failed')),
  body text not null,
  media jsonb not null default '[]'::jsonb,
  source_item_ids uuid[] not null default '{}',
  pillar text,
  scheduled_for timestamptz,
  rejection_reason text,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger drafts_set_updated_at
before update on public.drafts
for each row execute function public.set_updated_at();

create index drafts_account_status_idx
  on public.drafts (account_id, status);

create index drafts_scheduled_idx
  on public.drafts (scheduled_for)
  where status = 'approved';

create index drafts_embedding_idx
  on public.drafts using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================================
-- posts
--   Successfully published posts. Immutable history.
-- ============================================================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete set null,
  platform text not null check (platform in ('x', 'instagram')),
  external_post_id text not null,
  external_url text,
  body text not null,
  media jsonb not null default '[]'::jsonb,
  pillar text,
  posted_at timestamptz not null default now(),
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, external_post_id)
);

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create index posts_account_posted_idx
  on public.posts (account_id, posted_at desc);

create index posts_external_id_idx
  on public.posts (external_post_id);

create index posts_embedding_idx
  on public.posts using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Backfill the FK from ingested_items now that posts exists.
alter table public.ingested_items
  add constraint ingested_items_used_in_post_fk
  foreign key (used_in_post_id) references public.posts(id) on delete set null;

-- ============================================================================
-- post_metrics
--   Time-series engagement snapshot for a post.
-- ============================================================================
create table public.post_metrics (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  captured_at timestamptz not null default now(),
  impressions integer,
  likes integer,
  comments integer,
  shares integer,
  saves integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index post_metrics_post_captured_idx
  on public.post_metrics (post_id, captured_at desc);

-- ============================================================================
-- edit_pairs
--   (draft_body, final_body) pairs for tuning voice / fine-tuning later.
-- ============================================================================
create table public.edit_pairs (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete set null,
  original_body text not null,
  edited_body text not null,
  edit_distance integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger edit_pairs_set_updated_at
before update on public.edit_pairs
for each row execute function public.set_updated_at();

create index edit_pairs_account_idx
  on public.edit_pairs (account_id, created_at desc);

-- ============================================================================
-- RLS: enable on all tables; service_role bypasses RLS automatically, so
-- without any permissive policies regular roles get no access. We add an
-- explicit deny-by-default by enabling RLS without policies. v2 adds tenant
-- policies tied to Supabase Auth.
-- ============================================================================
alter table public.accounts enable row level security;
alter table public.platform_connections enable row level security;
alter table public.ingested_items enable row level security;
alter table public.drafts enable row level security;
alter table public.posts enable row level security;
alter table public.post_metrics enable row level security;
alter table public.edit_pairs enable row level security;

-- ============================================================================
-- Storage buckets
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('post-images', 'post-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('brand-assets', 'brand-assets', true)
  on conflict (id) do nothing;
