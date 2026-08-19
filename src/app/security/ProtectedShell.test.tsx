import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const organizationState = vi.hoisted(() => ({
  loading: false,
  revalidating: false,
  switching: false,
  memberships: [{ id: 'membership-present' }],
  activeMembership: null as { id: string } | null,
  error: null as string | null,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ initializing: false, user: { id: 'signed-in-user' } }),
}));

vi.mock('../contexts/OrganizationContext', () => ({
  useOrganization: () => organizationState,
}));

import { ProtectedShell } from './ProtectedShell';

describe('ProtectedShell', () => {
  it('does not render application content without a validated active membership', () => {
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>,
    );

    expect(markup).toContain('active organization membership could not be validated');
    expect(markup).not.toContain('Protected application');
  });

  it('keeps canonical dialog and unsaved state mounted during background revalidation', () => {
    organizationState.activeMembership = { id: 'membership-present' };
    organizationState.revalidating = true;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><div role="dialog"><input value="unsaved organization name" readOnly /></div></ProtectedShell>,
    );
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('unsaved organization name');
    expect(markup).not.toContain('Loading workspace');
  });

  it('removes protected content as soon as revalidation proves revocation', () => {
    organizationState.revalidating = false;
    organizationState.memberships = [];
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(<ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>);
    expect(markup).toContain('No organization access');
    expect(markup).not.toContain('Protected application');
  });
});
