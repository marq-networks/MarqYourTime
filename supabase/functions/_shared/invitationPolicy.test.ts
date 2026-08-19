import { describe, expect, it } from 'vitest';
import { parseInvitationRequest, RequestValidationError, toInvitationCommand } from './invitationPolicy';

const validInvite = {
  action: 'invite',
  email: ' Person@Example.com ',
  tenantId: '10000000-0000-4000-8000-000000000001',
  organizationId: '20000000-0000-4000-8000-000000000001',
  role: 'employee',
};

describe('trusted invitation request policy', () => {
  it('normalizes a bounded invitation command', () => {
    expect(toInvitationCommand(parseInvitationRequest(validInvite))).toEqual({
      ...validInvite,
      email: 'person@example.com',
    });
  });

  it.each([
    null,
    {},
    { ...validInvite, email: 'not-an-email' },
    { ...validInvite, tenantId: 'tenant-a' },
    { ...validInvite, role: 'owner' },
  ])('rejects malformed or unsupported input %#', (input) => {
    expect(() => parseInvitationRequest(input)).toThrow(RequestValidationError);
  });

  it('accepts no client-supplied identity or scope for acceptance', () => {
    expect(parseInvitationRequest({ action: 'accept', userId: 'attacker', role: 'platform_admin' })).toEqual({
      action: 'accept',
    });
  });
});
