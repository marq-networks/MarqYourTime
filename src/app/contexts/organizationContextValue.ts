import { createContext, useContext } from 'react';
import type { LaunchRole, ValidatedMembership } from '../security/types';

export interface OrganizationContextValue {
  loading: boolean;
  switching: boolean;
  memberships: ValidatedMembership[];
  activeMembership: ValidatedMembership | null;
  activeRole: LaunchRole | null;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function useOrganization() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error('useOrganization must be used inside OrganizationProvider');
  return value;
}
