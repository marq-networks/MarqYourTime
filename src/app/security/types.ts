export type LaunchRole = 'employee' | 'org_admin' | 'platform_admin';

export interface ValidatedMembership {
  id: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: LaunchRole;
}
