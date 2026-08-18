import { supabase } from '../../lib/supabase';
import type { LaunchRole, ValidatedMembership } from './types';

interface MembershipRow {
  id: string;
  tenant_id: string;
  organization_id: string;
  role: LaunchRole;
  organizations: { name: string; slug: string } | { name: string; slug: string }[];
}

/** Reads only rows already authorized by RLS; request filters are never authorization proof. */
export async function listCurrentMemberships(): Promise<ValidatedMembership[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('id, tenant_id, organization_id, role, organizations!inner(name, slug)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at');

  if (error) throw new Error('Unable to load organization access.');

  return ((data ?? []) as MembershipRow[]).map((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      organizationId: row.organization_id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      role: row.role,
    };
  });
}
