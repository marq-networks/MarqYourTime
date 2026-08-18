-- Phase 5 remote verification correction: explicitly remove Supabase default table privileges
-- and re-grant only the browser capabilities intended by the reviewed RLS design.

revoke all on table
  public.tenants,
  public.organizations,
  public.user_profiles,
  public.memberships,
  public.departments,
  public.worker_profiles,
  public.audit_events
from anon;

revoke insert, update, delete, truncate, references, trigger on table
  public.tenants,
  public.organizations,
  public.user_profiles,
  public.memberships,
  public.departments,
  public.worker_profiles,
  public.audit_events
from authenticated;

-- Re-establish only reviewed browser privileges. RLS still enforces row scope.
grant select on table
  public.tenants,
  public.organizations,
  public.user_profiles,
  public.memberships,
  public.departments,
  public.worker_profiles,
  public.audit_events
  to authenticated;

grant update(display_name, avatar_url, updated_at)
  on public.user_profiles to authenticated;

grant insert(name, tenant_id, organization_id), update(name, updated_at)
  on public.departments to authenticated;
