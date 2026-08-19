-- GAP-002: trusted invitation acceptance. The Edge boundary derives p_user_id from a verified JWT.
-- All invited memberships for that identity are activated and audited in the same transaction.
create or replace function public.trusted_accept_invitation(
  p_user_id uuid,
  p_correlation_id uuid
)
returns setof uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_membership public.memberships%rowtype;
begin
  for v_membership in
    select * from public.memberships
    where user_id = p_user_id and status = 'invited' and deleted_at is null
    for update
  loop
    update public.memberships
      set status = 'active', updated_at = now()
      where id = v_membership.id;

    insert into public.audit_events(
      actor_user_id, tenant_id, organization_id, actor_role, action,
      target_type, target_id, correlation_id, metadata
    ) values (
      p_user_id, v_membership.tenant_id, v_membership.organization_id, v_membership.role,
      'invitation.accepted', 'membership', v_membership.id, p_correlation_id,
      jsonb_build_object('new_status', 'active')
    );

    return next v_membership.id;
  end loop;
end
$$;

revoke all on function public.trusted_accept_invitation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.trusted_accept_invitation(uuid, uuid) to service_role;
