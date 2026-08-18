/** Contracts for Edge/server handlers. Never import this module into the browser bundle. */
export type MembershipRole = 'employee' | 'org_admin' | 'platform_admin';
export interface SetMembershipCommand {
  userId: string;
  tenantId: string;
  organizationId: string;
  role: MembershipRole;
  status: 'invited' | 'active' | 'inactive';
  remove?: boolean;
}
export interface InvitationCommand { email: string; tenantId: string; organizationId: string; role: MembershipRole }
// Implementations must authenticate the caller, parse input, authorize from memberships, use a
// server-only service-role client, and call trusted_set_membership. Client claims are never proof.
