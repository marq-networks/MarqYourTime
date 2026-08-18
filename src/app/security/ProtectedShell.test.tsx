import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ initializing: false, user: { id: 'signed-in-user' } }),
}));

vi.mock('../contexts/OrganizationContext', () => ({
  useOrganization: () => ({
    loading: false,
    switching: false,
    memberships: [{ id: 'membership-present' }],
    activeMembership: null,
    error: null,
  }),
}));

import { ProtectedShell } from './ProtectedShell';

describe('ProtectedShell', () => {
  it('does not render application content without a validated active membership', () => {
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>,
    );

    expect(markup).toContain('active organization membership could not be validated');
    expect(markup).not.toContain('Protected application');
  });
});
