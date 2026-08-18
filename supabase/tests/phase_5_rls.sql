begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users(id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','employee@test.local','',now(),now(),now()),
 ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other@test.local','',now(),now(),now()),
 ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin@test.local','',now(),now(),now()),
 ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','platform@test.local','',now(),now(),now()),
 ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','inactive@test.local','',now(),now(),now());
insert into public.tenants(id,name,slug) values
 ('10000000-0000-0000-0000-000000000001','Tenant A','tenant-a'),('10000000-0000-0000-0000-000000000002','Tenant B','tenant-b');
insert into public.organizations(id,tenant_id,name,slug) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Org A','org-a'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Org B','org-b');
insert into public.memberships(id,user_id,tenant_id,organization_id,role,status) values
 ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','employee','active'),
 ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','employee','active'),
 ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','org_admin','active'),
 ('30000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','platform_admin','active'),
 ('30000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','employee','inactive');
insert into public.departments(id,tenant_id,organization_id,name) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','A Dept'),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','B Dept');
insert into public.audit_events(id,actor_user_id,tenant_id,organization_id,actor_role,action,target_type)
values ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','org_admin','test','membership');

set local role anon;
select is((select count(*)::int from public.tenants), 0, 'unauthenticated cannot read tenant data');
reset role; set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select is((select count(*)::int from public.departments where organization_id='20000000-0000-0000-0000-000000000002'),0,'employee cannot read another organization');
select throws_ok($$update public.memberships set role='platform_admin' where user_id='00000000-0000-0000-0000-000000000001'$$,'42501',null,'employee cannot grant role');
select is((select count(*)::int from public.departments where organization_id='20000000-0000-0000-0000-000000000001'),1,'same-organization member read succeeds');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
update public.departments set name='hacked' where id='40000000-0000-0000-0000-000000000002';
select is((select count(*)::int from public.departments where name='hacked'),0,'org admin cannot administer unrelated organization');
select throws_ok($$update public.memberships set role='platform_admin' where user_id='00000000-0000-0000-0000-000000000003'$$,'42501',null,'org admin cannot promote self');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
select is((select count(*)::int from public.tenants),2,'platform admin derives global access from backend membership');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000005',true);
select is((select count(*)::int from public.departments),0,'inactive membership grants no access');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select is((select count(*)::int from public.departments where organization_id='20000000-0000-0000-0000-000000000002'),0,'client organization filter cannot bypass membership');
select throws_ok($$delete from public.audit_events where id='50000000-0000-0000-0000-000000000001'$$,'42501',null,'normal client cannot delete audit records');
select * from finish();
rollback;
