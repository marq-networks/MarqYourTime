import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => ({
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn(() => query) },
}));

import { listCurrentMemberships } from './membershipRepository';

describe('listCurrentMemberships', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.is.mockReturnValue(query);
    query.order.mockResolvedValue({
      data: [{
        id: 'platform-membership',
        tenant_id: 'tenant-a',
        organization_id: 'organization-a',
        role: 'platform_admin',
        organizations: { name: 'Organization A', slug: 'organization-a' },
      }],
      error: null,
    });
  });

  it('selects only the signed-in platform admin memberships despite global RLS read access', async () => {
    const memberships = await listCurrentMemberships('signed-in-platform-admin');

    expect(query.eq).toHaveBeenCalledWith('user_id', 'signed-in-platform-admin');
    expect(memberships).toEqual([expect.objectContaining({
      id: 'platform-membership',
      role: 'platform_admin',
    })]);
  });
});
