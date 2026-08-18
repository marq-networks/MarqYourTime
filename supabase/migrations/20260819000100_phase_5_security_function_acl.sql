-- Phase 5 remote verification correction: remove anonymous EXECUTE from RLS helper SECURITY DEFINER functions.
-- Authenticated EXECUTE remains intentional because RLS policies call these helpers in signed-in queries.
revoke execute on function public.is_platform_admin() from anon;
revoke execute on function public.is_active_member(uuid) from anon;
revoke execute on function public.is_org_admin(uuid) from anon;
