-- Run with `supabase test db` against a disposable/staging copy after migration.
-- Not executed during this review: no authenticated database connection was available.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);
select ok((select relrowsecurity from pg_class where oid = 'public.void_packs'::regclass), 'Pack metadata uses RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.security_rate_limits'::regclass), 'Rate-limit state uses RLS');
select ok(not has_table_privilege('anon','public.void_packs','INSERT'), 'Anonymous pack inserts denied');
select ok(not has_table_privilege('authenticated','public.void_packs','UPDATE'), 'Client pack updates denied');
select ok(not has_table_privilege('anon','public.void_packs','DELETE'), 'Anonymous pack deletion denied');
select ok(not has_table_privilege('anon','public.security_rate_limits','SELECT'), 'Rate-limit state is private');
select ok(not has_function_privilege('anon','public.security_take_token(text,integer,integer)','EXECUTE'), 'Anonymous rate-limit resets denied');
select ok(has_function_privilege('service_role','public.security_take_token(text,integer,integer)','EXECUTE'), 'Server can use the rate limiter');
select is((select count(*)::integer from generate_series(1,20) where public.security_take_token('isolated-security-test-' || txid_current(),5,86400)),5,'One atomic bucket permits only five immediate requests');
select is((select count(*)::integer from pg_policies where schemaname='storage' and tablename='objects' and policyname in ('voidwallz_no_client_storage_insert','voidwallz_no_client_storage_update','voidwallz_no_client_storage_delete') and permissive='RESTRICTIVE'),3,'Client storage writes use restrictive policies');
set local role anon;
select throws_ok($$ insert into public.void_packs default values $$,'42501',null,'Anonymous direct table insert is denied');
select throws_ok($$ insert into storage.objects(bucket_id,name) values('wallpapers','security-check-never-created.png') $$,'42501',null,'Anonymous direct wallpaper upload is denied');
reset role;
select * from finish();
rollback;
