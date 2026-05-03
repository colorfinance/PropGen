-- AutoPost vault helpers
--
-- OAuth tokens for platform_connections are stored in Supabase Vault
-- (`vault.secrets`). Application code stores ONLY the secret UUID in
-- `platform_connections.oauth_token_encrypted` / `oauth_refresh_token_encrypted`.
--
-- Feature code must go through the helpers below; do not touch `vault.*`
-- directly. These helpers are SECURITY DEFINER so they run with the privileges
-- of the migration owner (postgres). They are revoked from public and granted
-- to service_role only.

create or replace function public.vault_store_secret(
  p_name text,
  p_secret text
)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_id uuid;
begin
  v_id := vault.create_secret(p_secret, p_name);
  return v_id;
end;
$$;

create or replace function public.vault_read_secret(
  p_secret_id uuid
)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret text;
begin
  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where id = p_secret_id;
  return v_secret;
end;
$$;

create or replace function public.vault_delete_secret(
  p_secret_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  delete from vault.secrets where id = p_secret_id;
end;
$$;

-- Lock down access. service_role bypasses RLS but still needs EXECUTE on
-- functions.
revoke all on function public.vault_store_secret(text, text) from public;
revoke all on function public.vault_read_secret(uuid) from public;
revoke all on function public.vault_delete_secret(uuid) from public;

grant execute on function public.vault_store_secret(text, text) to service_role;
grant execute on function public.vault_read_secret(uuid) to service_role;
grant execute on function public.vault_delete_secret(uuid) to service_role;
