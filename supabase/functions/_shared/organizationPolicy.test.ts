import { describe, expect, it } from 'vitest';
import { parseOrganizationCommand } from './organizationPolicy';

const valid = { tenantId: '10000000-0000-4000-8000-000000000001', name: ' New Org ', slug: 'new-org', status: 'active' };
describe('organization administration policy', () => {
  it('normalizes create input', () => expect(parseOrganizationCommand(valid)).toEqual({ ...valid, name: 'New Org', organizationId: null }));
  it.each([
    { ...valid, tenantId: 'other' }, { ...valid, organizationId: 'other' }, { ...valid, name: '' },
    { ...valid, slug: 'Not Valid' }, { ...valid, status: 'suspended' },
  ])('rejects invalid commands %#', (input) => expect(() => parseOrganizationCommand(input)).toThrow());
});
