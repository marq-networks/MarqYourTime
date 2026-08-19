import type { InvitationCommand, MembershipRole } from './trustedOperations.ts';

export type InvitationAction = 'invite' | 'accept' | 'resend';

export interface InvitationRequest {
  action: InvitationAction;
  email?: string;
  tenantId?: string;
  organizationId?: string;
  role?: MembershipRole;
}

export class RequestValidationError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set<MembershipRole>(['employee', 'org_admin', 'platform_admin']);

export function parseInvitationRequest(value: unknown): InvitationRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError('A JSON request body is required.');
  }

  const input = value as Record<string, unknown>;
  if (input.action === 'accept') return { action: 'accept' };
  if (input.action !== 'invite' && input.action !== 'resend') throw new RequestValidationError('Unsupported invitation action.');

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const tenantId = typeof input.tenantId === 'string' ? input.tenantId : '';
  const organizationId = typeof input.organizationId === 'string' ? input.organizationId : '';
  const role = input.role;

  if (!EMAIL.test(email) || email.length > 254) throw new RequestValidationError('A valid email is required.');
  if (!UUID.test(tenantId) || !UUID.test(organizationId)) {
    throw new RequestValidationError('Valid tenant and organization identifiers are required.');
  }
  if (typeof role !== 'string' || !ROLES.has(role as MembershipRole)) {
    throw new RequestValidationError('A supported membership role is required.');
  }

  return { action: input.action, email, tenantId, organizationId, role: role as MembershipRole };
}

export function toInvitationCommand(request: InvitationRequest): InvitationCommand {
  if (request.action !== 'invite' && request.action !== 'resend') throw new RequestValidationError('Invite details are required.');
  return request as InvitationCommand & InvitationRequest;
}
