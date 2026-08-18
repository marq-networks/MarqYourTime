-- Work OS Phase 5: forward-only tenancy, membership, People dependency, RLS and audit foundation.
create extension if not exists pgcrypto with schema extensions;

create type public.membership_role as enum ('employee', 'org_admin', 'platform_admin');
create type public.membership_status as enum ('invited', 'active', 'inactive');

create table public.tenants (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  unique (id, tenant_id)
);

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or length(trim(display_name)) between 1 and 160),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every role assignment has an explicit organization and matching tenant. Platform capability is
-- recognized only from an active backend row; no nullable scope can accidentally become global.
create table public.memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null,
  organization_id uuid not null,
  role public.membership_role not null,
  status public.membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint memberships_organization_tenant_fk foreign key (organization_id, tenant_id)
    references public.organizations(id, tenant_id) on delete restrict,
  constraint memberships_deleted_inactive check (deleted_at is null or status <> 'active')
);
create unique index memberships_one_live_user_org on public.memberships(user_id, organization_id)
  where deleted_at is null;
create index memberships_active_user on public.memberships(user_id, organization_id)
  where status = 'active' and deleted_at is null;
create index memberships_tenant_org on public.memberships(tenant_id, organization_id);

create table public.departments (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint departments_organization_tenant_fk foreign key (organization_id, tenant_id)
    references public.organizations(id, tenant_id) on delete restrict,
  unique (organization_id, name),
  unique (id, organization_id, tenant_id)
);

create table public.worker_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  tenant_id uuid not null,
  organization_id uuid not null,
  department_id uuid,
  job_title text check (job_title is null or length(job_title) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worker_organization_tenant_fk foreign key (organization_id, tenant_id)
    references public.organizations(id, tenant_id) on delete restrict,
  constraint worker_department_scope_fk foreign key (department_id, organization_id, tenant_id)
    references public.departments(id, organization_id, tenant_id) on delete restrict,
  unique (user_id, organization_id),
  unique (id, organization_id, tenant_id)
);
create index worker_profiles_scope on public.worker_profiles(organization_id, user_id);

create table public.audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete restrict,
  organization_id uuid,
  actor_role public.membership_role,
  action text not null check (length(trim(action)) between 1 and 120),
  target_type text not null check (length(trim(target_type)) between 1 and 120),
  target_id uuid,
  correlation_id uuid not null default extensions.gen_random_uuid(),
  source text not null default 'trusted_server' check (source in ('trusted_server', 'database_trigger', 'system')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  constraint audit_organization_tenant_fk foreign key (organization_id, tenant_id)
    references public.organizations(id, tenant_id) on delete restrict
);
create index audit_events_scope_time on public.audit_events(tenant_id, organization_id, occurred_at desc);
create index audit_events_actor_time on public.audit_events(actor_user_id, occurred_at desc);

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select exists (select 1 from public.memberships m where m.user_id = auth.uid()
    and m.role = 'platform_admin' and m.status = 'active' and m.deleted_at is null)
$$;
create or replace function public.is_active_member(requested_organization_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select public.is_platform_admin() or exists (select 1 from public.memberships m where m.user_id = auth.uid()
    and m.organization_id = requested_organization_id and m.status = 'active' and m.deleted_at is null)
$$;
create or replace function public.is_org_admin(requested_organization_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select public.is_platform_admin() or exists (select 1 from public.memberships m where m.user_id = auth.uid()
    and m.organization_id = requested_organization_id and m.role = 'org_admin'
    and m.status = 'active' and m.deleted_at is null)
$$;
revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_active_member(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_active_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;

alter table public.tenants enable row level security;
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.departments enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.audit_events enable row level security;
alter table public.tenants force row level security;
alter table public.organizations force row level security;
alter table public.user_profiles force row level security;
alter table public.memberships force row level security;
alter table public.departments force row level security;
alter table public.worker_profiles force row level security;
alter table public.audit_events force row level security;

create policy tenants_read_member on public.tenants for select to authenticated using (
  public.is_platform_admin() or exists (select 1 from public.memberships m where m.user_id = auth.uid()
    and m.tenant_id = tenants.id and m.status = 'active' and m.deleted_at is null));
create policy organizations_read_member on public.organizations for select to authenticated using (public.is_active_member(id));
create policy profiles_read_self_or_shared_org on public.user_profiles for select to authenticated using (
  user_id = auth.uid() or public.is_platform_admin() or exists (
    select 1 from public.memberships mine join public.memberships theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid() and theirs.user_id = user_profiles.user_id
      and mine.status = 'active' and theirs.status = 'active' and mine.deleted_at is null and theirs.deleted_at is null));
create policy profiles_update_self on public.user_profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy memberships_read_allowed on public.memberships for select to authenticated using (
  public.is_platform_admin() or (user_id = auth.uid() and status = 'active' and deleted_at is null)
  or public.is_org_admin(organization_id));
create policy departments_read_member on public.departments for select to authenticated using (public.is_active_member(organization_id));
create policy departments_admin_insert on public.departments for insert to authenticated with check (public.is_org_admin(organization_id));
create policy departments_admin_update on public.departments for update to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));
create policy worker_profiles_read_member on public.worker_profiles for select to authenticated using (public.is_active_member(organization_id));
create policy worker_profiles_update_self on public.worker_profiles for update to authenticated
  using (user_id = auth.uid() and public.is_active_member(organization_id))
  with check (user_id = auth.uid() and public.is_active_member(organization_id));
create policy audit_events_admin_read on public.audit_events for select to authenticated using (
  public.is_platform_admin() or (organization_id is not null and public.is_org_admin(organization_id)));
-- No authenticated INSERT/UPDATE/DELETE policies exist for memberships or audit_events.

-- Trusted-server-only membership mutation. Actor/scope/role are recomputed from backend rows and
-- mutation plus audit share one transaction. Edge/server code may set request.correlation_id.
create or replace function public.trusted_set_membership(
  p_actor_user_id uuid, p_user_id uuid, p_tenant_id uuid, p_organization_id uuid,
  p_role public.membership_role, p_status public.membership_status, p_delete boolean default false)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_id uuid; v_actor_role public.membership_role; v_correlation uuid;
begin
  select m.role into v_actor_role from public.memberships m where m.user_id = p_actor_user_id
    and m.status = 'active' and m.deleted_at is null
    and (m.role = 'platform_admin' or (m.role = 'org_admin' and m.organization_id = p_organization_id))
    order by (m.role = 'platform_admin') desc limit 1;
  if v_actor_role is null then raise exception 'actor is not authorized'; end if;
  if p_role = 'platform_admin' and v_actor_role <> 'platform_admin' then raise exception 'platform admin required'; end if;
  if not exists (select 1 from public.organizations o where o.id=p_organization_id and o.tenant_id=p_tenant_id) then
    raise exception 'organization tenant mismatch'; end if;
  insert into public.memberships(user_id, tenant_id, organization_id, role, status, deleted_at)
  values (p_user_id, p_tenant_id, p_organization_id, p_role, case when p_delete then 'inactive' else p_status end,
    case when p_delete then now() else null end)
  on conflict (user_id, organization_id) where deleted_at is null do update set role=excluded.role,
    status=excluded.status, deleted_at=excluded.deleted_at, updated_at=now() returning id into v_id;
  begin v_correlation := nullif(current_setting('request.correlation_id', true), '')::uuid;
  exception when invalid_text_representation then v_correlation := null; end;
  insert into public.audit_events(actor_user_id, tenant_id, organization_id, actor_role, action, target_type, target_id, correlation_id,
    metadata) values (p_actor_user_id, p_tenant_id, p_organization_id, v_actor_role,
    case when p_delete then 'membership.removed' else 'membership.changed' end, 'membership', v_id,
    coalesce(v_correlation, extensions.gen_random_uuid()), jsonb_build_object('new_role', p_role, 'new_status', p_status));
  return v_id;
end $$;
revoke all on function public.trusted_set_membership(uuid,uuid,uuid,uuid,public.membership_role,public.membership_status,boolean) from public, anon, authenticated;
grant execute on function public.trusted_set_membership(uuid,uuid,uuid,uuid,public.membership_role,public.membership_status,boolean) to service_role;

grant select on public.tenants, public.organizations, public.user_profiles, public.memberships, public.departments, public.worker_profiles, public.audit_events to authenticated;
grant update(display_name, avatar_url, updated_at) on public.user_profiles to authenticated;
grant insert(name, tenant_id, organization_id), update(name, updated_at) on public.departments to authenticated;
grant update(job_title, department_id, updated_at) on public.worker_profiles to authenticated;
