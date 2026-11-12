-- Review against the correct Voidwallz project, then apply in a transaction.
-- This migration changes permissions; it does not delete wallpaper files or rows.
begin;

create table if not exists public.security_rate_limits (
  key text primary key,
  tokens double precision not null,
  updated_at timestamptz not null default now()
);
alter table public.security_rate_limits enable row level security;
revoke all on public.security_rate_limits from public, anon, authenticated, service_role;
-- The SECURITY DEFINER function owns counter writes; even the API server only
-- receives EXECUTE on that fixed operation, not direct counter-table access.

create or replace function public.security_take_token(p_key text, p_capacity integer, p_refill_seconds integer)
returns boolean language plpgsql security definer set search_path = pg_catalog as $$
declare
  bucket public.security_rate_limits%rowtype;
  current_time timestamptz := clock_timestamp();
  available double precision;
begin
  if length(p_key) > 160 or p_capacity < 1 or p_capacity > 100 or p_refill_seconds < 1 or p_refill_seconds > 86400 then
    raise exception 'Invalid rate limit arguments';
  end if;
  insert into public.security_rate_limits(key, tokens, updated_at)
    values(p_key, p_capacity, current_time) on conflict (key) do nothing;
  select * into bucket from public.security_rate_limits where key = p_key for update;
  available := least(p_capacity, bucket.tokens + greatest(0, extract(epoch from current_time - bucket.updated_at)) / p_refill_seconds);
  update public.security_rate_limits set tokens = greatest(0, available - case when available >= 1 then 1 else 0 end), updated_at = current_time where key = p_key;
  -- Opportunistically expire idle keys; no raw addresses or request bodies are stored.
  if random() < 0.01 then delete from public.security_rate_limits where updated_at < current_time - interval '2 days'; end if;
  return available >= 1;
end;
$$;
revoke all on function public.security_take_token(text, integer, integer) from public, anon, authenticated;
grant execute on function public.security_take_token(text, integer, integer) to service_role;

-- Content metadata is public read-only. All writes must pass the server admin API.
do $$
begin
  if to_regclass('public.void_packs') is not null then
    alter table public.void_packs enable row level security;
    revoke insert, update, delete, truncate, references, trigger on public.void_packs from public, anon, authenticated;
    grant select on public.void_packs to anon, authenticated;
    revoke all on public.void_packs from service_role;
    grant select, insert, delete on public.void_packs to service_role;
    drop policy if exists voidwallz_public_read on public.void_packs;
    create policy voidwallz_public_read on public.void_packs for select to anon, authenticated using (true);
    -- Restrictive policies also defeat accidental permissive grants/policies added later.
    drop policy if exists voidwallz_no_client_insert on public.void_packs;
    create policy voidwallz_no_client_insert on public.void_packs as restrictive for insert to anon, authenticated with check (false);
    drop policy if exists voidwallz_no_client_update on public.void_packs;
    create policy voidwallz_no_client_update on public.void_packs as restrictive for update to anon, authenticated using (false) with check (false);
    drop policy if exists voidwallz_no_client_delete on public.void_packs;
    create policy voidwallz_no_client_delete on public.void_packs as restrictive for delete to anon, authenticated using (false);
  end if;
end;
$$;

-- Restrict only the known wallpaper bucket; leave other application buckets alone.
drop policy if exists voidwallz_read_wallpapers on storage.objects;
create policy voidwallz_read_wallpapers on storage.objects for select to anon, authenticated using (bucket_id = 'wallpapers');
drop policy if exists voidwallz_no_client_storage_insert on storage.objects;
create policy voidwallz_no_client_storage_insert on storage.objects as restrictive for insert to anon, authenticated with check (bucket_id <> 'wallpapers');
drop policy if exists voidwallz_no_client_storage_update on storage.objects;
create policy voidwallz_no_client_storage_update on storage.objects as restrictive for update to anon, authenticated using (bucket_id <> 'wallpapers') with check (bucket_id <> 'wallpapers');
drop policy if exists voidwallz_no_client_storage_delete on storage.objects;
create policy voidwallz_no_client_storage_delete on storage.objects as restrictive for delete to anon, authenticated using (bucket_id <> 'wallpapers');
update storage.buckets set file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'] where id = 'wallpapers';
commit;
