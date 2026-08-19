-- Phase 5 closeout: keep RLS predicates out of the exposed public API and define the
-- minimum secure organization lifecycle needed by access-control verification.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

alter table public.organizations
  add column status text not null default 'active'
  check (status in ('active', 'deactivated'));

create or replace function private.is_platform_admin()
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select exists (
    select 1 from public.memberships m
    join public.organizations o on o.id = m.organization_id and o.tenant_id = m.tenant_id
    where m.user_id = auth.uid() and m.role = 'platform_admin' and m.status = 'active'
      and m.deleted_at is null and o.status = 'active')
$$;
create or replace function private.is_active_member(requested_organization_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, private as $$
  select private.is_platform_admin() or exists (
    select 1 from public.memberships m join public.organizations o on o.id=m.organization_id
    where m.user_id=auth.uid() and m.organization_id=requested_organization_id
      and m.status='active' and m.deleted_at is null and o.status='active')
$$;
create or replace function private.is_org_admin(requested_organization_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, private as $$
  select private.is_platform_admin() or exists (
    select 1 from public.memberships m join public.organizations o on o.id=m.organization_id
    where m.user_id=auth.uid() and m.organization_id=requested_organization_id
      and m.role='org_admin' and m.status='active' and m.deleted_at is null and o.status='active')
$$;
revoke all on function private.is_platform_admin() from public, anon;
revoke all on function private.is_active_member(uuid) from public, anon;
revoke all on function private.is_org_admin(uuid) from public, anon;
grant execute on function private.is_platform_admin(), private.is_active_member(uuid), private.is_org_admin(uuid) to authenticated;

alter policy tenants_read_member on public.tenants using (
  private.is_platform_admin() or exists (select 1 from public.memberships m
    join public.organizations o on o.id=m.organization_id
    where m.user_id=auth.uid() and m.tenant_id=tenants.id and m.status='active'
      and m.deleted_at is null and o.status='active'));
alter policy organizations_read_member on public.organizations using (private.is_active_member(id));
alter policy profiles_read_self_or_shared_org on public.user_profiles using (
  user_id=auth.uid() or private.is_platform_admin() or exists (
    select 1 from public.memberships mine join public.memberships theirs on theirs.organization_id=mine.organization_id
    join public.organizations o on o.id=mine.organization_id
    where mine.user_id=auth.uid() and theirs.user_id=user_profiles.user_id and mine.status='active'
      and theirs.status='active' and mine.deleted_at is null and theirs.deleted_at is null and o.status='active'));
alter policy memberships_read_allowed on public.memberships using (
  private.is_platform_admin() or (user_id=auth.uid() and status='active' and deleted_at is null
    and exists (select 1 from public.organizations o where o.id=organization_id and o.status='active'))
  or private.is_org_admin(organization_id));
alter policy departments_read_member on public.departments using (private.is_active_member(organization_id));
alter policy departments_admin_insert on public.departments with check (private.is_org_admin(organization_id));
alter policy departments_admin_update on public.departments using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
alter policy worker_profiles_read_member on public.worker_profiles using (private.is_active_member(organization_id));
alter policy audit_events_admin_read on public.audit_events using (
  private.is_platform_admin() or (organization_id is not null and private.is_org_admin(organization_id)));

drop function public.is_active_member(uuid);
drop function public.is_org_admin(uuid);
drop function public.is_platform_admin();

create or replace function public.trusted_manage_organization(
  p_actor_user_id uuid, p_tenant_id uuid, p_organization_id uuid,
  p_name text, p_slug text, p_status text, p_correlation_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog, public as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.memberships m join public.organizations o on o.id=m.organization_id
    where m.user_id=p_actor_user_id and m.role='platform_admin' and m.status='active'
      and m.deleted_at is null and o.status='active') then raise exception 'platform admin required'; end if;
  if p_status not in ('active','deactivated') then raise exception 'invalid organization status'; end if;
  if p_organization_id is null then
    insert into public.organizations(tenant_id,name,slug,status)
      values(p_tenant_id,trim(p_name),p_slug,p_status) returning id into v_id;
  else
    update public.organizations set name=trim(p_name), slug=p_slug, status=p_status, updated_at=now()
      where id=p_organization_id and tenant_id=p_tenant_id returning id into v_id;
    if v_id is null then raise exception 'organization tenant mismatch'; end if;
  end if;
  insert into public.audit_events(actor_user_id,tenant_id,organization_id,actor_role,action,target_type,target_id,correlation_id,metadata)
    values(p_actor_user_id,p_tenant_id,v_id,'platform_admin',
      case when p_organization_id is null then 'organization.created' else 'organization.updated' end,
      'organization',v_id,p_correlation_id,jsonb_build_object('status',p_status));
  return v_id;
end $$;
revoke all on function public.trusted_manage_organization(uuid,uuid,uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.trusted_manage_organization(uuid,uuid,uuid,text,text,text,uuid) to service_role;
