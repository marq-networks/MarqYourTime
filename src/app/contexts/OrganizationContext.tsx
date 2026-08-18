import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { listCurrentMemberships } from '../security/membershipRepository';
import type { LaunchRole, ValidatedMembership } from '../security/types';

const PREFERENCE_KEY = 'workos_active_organization_preference';

interface OrganizationContextValue {
  loading: boolean;
  switching: boolean;
  memberships: ValidatedMembership[];
  activeMembership: ValidatedMembership | null;
  activeRole: LaunchRole | null;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [memberships, setMemberships] = useState<ValidatedMembership[]>([]);
  const [activeMembership, setActiveMembership] = useState<ValidatedMembership | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setMemberships([]);
      setActiveMembership(null);
      setError(null);
      return;
    }
    setLoading(true);
    setActiveMembership(null); // Never render stale organization data while revalidating.
    try {
      const valid = await listCurrentMemberships(user.id);
      const preference = localStorage.getItem(PREFERENCE_KEY);
      const selected = valid.find((item) => item.organizationId === preference) ?? valid[0] ?? null;
      setMemberships(valid);
      setActiveMembership(selected);
      if (selected) localStorage.setItem(PREFERENCE_KEY, selected.organizationId);
      else localStorage.removeItem(PREFERENCE_KEY);
      setError(null);
    } catch {
      setMemberships([]);
      setError('Organization access could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const switchOrganization = useCallback(async (organizationId: string) => {
    if (!user) throw new Error('Organization access requires an authenticated user.');
    setSwitching(true);
    setActiveMembership(null);
    try {
      const valid = await listCurrentMemberships(user.id);
      const selected = valid.find((item) => item.organizationId === organizationId);
      if (!selected) throw new Error('Organization is not available to this account.');
      setMemberships(valid);
      setActiveMembership(selected);
      localStorage.setItem(PREFERENCE_KEY, selected.organizationId);
      window.dispatchEvent(new CustomEvent('workos-organization-changed', { detail: { organizationId } }));
    } finally {
      setSwitching(false);
    }
  }, [user]);

  const value = useMemo(() => ({ loading, switching, memberships, activeMembership,
    activeRole: activeMembership?.role ?? null, error, switchOrganization, refresh }),
    [loading, switching, memberships, activeMembership, error, switchOrganization, refresh]);
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error('useOrganization must be used inside OrganizationProvider');
  return value;
}
