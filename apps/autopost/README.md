# Local Theory · AutoPost

Autonomous social posting engine for Local Theory. AutoPost ingests source material (RSS, scrapers, manual uploads), generates platform-tailored drafts with Claude, optionally auto-publishes within posting windows, captures engagement metrics, and feeds edits back into a per-account voice profile.

> **Status: Step 1 of 10 complete — foundation only, no business logic.**

## Architecture (high level)

```
                 ┌─────────────────────────────────────────────────┐
                 │                   Vercel                        │
                 │                                                 │
   ┌────────┐    │  ┌──────────────┐    ┌─────────────────────┐    │
   │ Admin  │────┼──│ Next.js App  │    │ Cron handlers       │    │
   │ (web)  │    │  │ (App Router) │    │ /api/cron/[job]     │    │
   └────────┘    │  └──────┬───────┘    └──────────┬──────────┘    │
                 │         │                       │               │
                 └─────────┼───────────────────────┼───────────────┘
                           │                       │
                           ▼                       ▼
                 ┌──────────────────────────────────────────────┐
                 │                 Supabase                     │
                 │  Postgres + pgvector + Storage + Vault       │
                 │                                              │
                 │  accounts · platform_connections             │
                 │  ingested_items · drafts · posts             │
                 │  post_metrics · edit_pairs                   │
                 └──────────────────────────────────────────────┘
                           │                       │
        ┌──────────────────┴───────────────────────┴──────────────────┐
        ▼                                                             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ┌──────────────┐
  │ Anthropic│  │ OpenAI   │  │ Replicate│  │ Telegram │    │ X · Instagram│
  │ (drafts) │  │ (embeds) │  │ (images) │  │ (alerts) │    │ (publishing) │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘    └──────────────┘
```

## Local development

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (free tier is fine)
- API keys for: Anthropic, OpenAI, Replicate, Telegram bot, X developer app, Meta/Instagram app

### Setup

```bash
# 1. Install dependencies
cd apps/autopost
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in every value — env validation will fail fast otherwise.

# 3. Apply migrations to Supabase
#    Option A — Supabase CLI (recommended):
#      supabase link --project-ref <your-ref>
#      supabase db push
#    Option B — paste each file in supabase/migrations/ into the SQL editor in order.

# 4. (Optional) Generate typed DB client
SUPABASE_PROJECT_ID=<your-ref> npm run db:types

# 5. Run dev server (webpack — turbopack opt-in only)
npm run dev
```

Open <http://localhost:3000>. You'll be redirected to `/admin`, then to `/admin/login`. Sign in with `ADMIN_PASSWORD`.

### Useful scripts

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Dev server on :3000 (webpack)                        |
| `npm run build`     | Production build (webpack)                           |
| `npm run start`     | Run production build                                 |
| `npm run lint`      | ESLint                                               |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run db:types`  | Regenerate `src/db/types.ts` from Supabase schema    |

## Deployment to Vercel

1. Connect this repo to a Vercel project. Set the root directory to `apps/autopost`.
2. Add every env var from `.env.example` in Vercel project settings (all environments).
3. Deploy. The first deploy activates the cron schedules in `vercel.json`:
   - `/api/cron/ingest` — hourly
   - `/api/cron/generate` — every 15 minutes
   - `/api/cron/publish` — every 5 minutes
   - `/api/cron/metrics` — daily 02:00 UTC
   - `/api/cron/voice-update` — Sunday 03:00 UTC
4. Vercel automatically attaches `Authorization: Bearer $CRON_SECRET` to cron requests when `CRON_SECRET` is set as an env var.

## Repository layout

```
apps/autopost/
├── src/
│   ├── app/
│   │   ├── admin/            # Admin dashboard (gated by middleware)
│   │   ├── api/admin/        # login / logout
│   │   └── api/cron/[job]/   # Vercel cron handlers (stubbed)
│   ├── components/
│   │   ├── admin/            # Sidebar, page header, stat card, etc.
│   │   └── ui/               # shadcn/ui primitives
│   ├── db/                   # Typed Supabase clients (server + browser)
│   ├── lib/
│   │   ├── admin-auth.ts     # HMAC-signed admin session cookie
│   │   ├── env.ts            # Zod-validated env at boot
│   │   ├── logger.ts         # Structured JSON logger
│   │   └── result.ts         # Result<T, E> discriminated union
│   └── proxy.ts              # /admin/* gate (Next 16 successor to middleware.ts)
├── supabase/migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_vault_setup.sql
└── vercel.json               # Cron schedules
```

## Coding conventions

- Strict TypeScript. No `any`.
- Server components by default; client components only where interactivity demands.
- All async functions return `Result<T, E>` (see `src/lib/result.ts`).
- All DB access goes through `src/db/server.ts` — no inline `createClient`.
- Env vars are validated at boot via Zod (`src/lib/env.ts`).
- shadcn/ui for admin UI primitives. Lucide for icons. Tailwind v4 with CSS variables.

## Roadmap

- **Step 1 — Foundation (this commit).** Scaffold, env, DB client, schema, admin gate, cron skeleton.
- **Step 2** — Account CRUD + X/Instagram OAuth + token vaulting.
- **Step 3** — Source ingestion (RSS + manual + scrapers).
- **Step 4** — Draft generation (Claude + embeddings + pillar retrieval).
- **Step 5** — Publishing (X, Instagram) + scheduling.
- **Step 6** — Metrics capture.
- **Step 7** — Voice profile updates from edit pairs.
- **Step 8** — Telegram approval flow.
- **Step 9** — Auto-mode (full autonomy with guardrails).
- **Step 10** — Multi-tenant Supabase Auth + tightened RLS.
