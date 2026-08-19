import { beforeEach, describe, expect, it, vi } from 'vitest';

const organizationQuery = vi.hoisted(() => ({ select: vi.fn(), order: vi.fn() }));
const tenantQuery = vi.hoisted(() => ({ select: vi.fn(), order: vi.fn() }));
const invoke = vi.hoisted(() => vi.fn());
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => table === 'organizations' ? organizationQuery : tenantQuery),
    functions: { invoke },
  },
}));

import { listPlatformOrganizations, listPlatformTenants, savePlatformOrganization } from './organizationAdministration';

describe('platform organization administration adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    organizationQuery.select.mockReturnValue(organizationQuery);
    tenantQuery.select.mockReturnValue(tenantQuery);
  });

  it('maps authoritative organization and tenant rows', async () => {
    organizationQuery.order.mockResolvedValue({ data: [{ id: 'org-1', tenant_id: 'tenant-1', name: 'MARQ Networks', slug: 'marq-networks', status: 'active', tenants: { name: 'MARQ' } }], error: null });
    tenantQuery.order.mockResolvedValue({ data: [{ id: 'tenant-1', name: 'MARQ', slug: 'marq' }], error: null });
    await expect(listPlatformOrganizations()).resolves.toEqual([{ id: 'org-1', tenantId: 'tenant-1', tenantName: 'MARQ', name: 'MARQ Networks', slug: 'marq-networks', status: 'active' }]);
    await expect(listPlatformTenants()).resolves.toEqual([{ id: 'tenant-1', name: 'MARQ', slug: 'marq' }]);
  });

  it('creates through the authenticated trusted Edge Function and returns audit correlation', async () => {
    const command = { tenantId: 'tenant-1', name: 'QA Organization', slug: 'qa-organization', status: 'active' as const };
    invoke.mockResolvedValue({ data: { organizationId: 'org-2', correlationId: 'correlation-1' }, error: null });
    await expect(savePlatformOrganization(command)).resolves.toEqual({ organizationId: 'org-2', correlationId: 'correlation-1' });
    expect(invoke).toHaveBeenCalledWith('organization-administration', { body: command });
  });

  it('does not report success when the trusted boundary fails', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'denied' } });
    await expect(savePlatformOrganization({ tenantId: 'tenant-1', name: 'Denied', slug: 'denied', status: 'active' })).rejects.toThrow('not completed');
  });
});
