import { RequestValidationError } from './invitationPolicy.ts';

export interface OrganizationCommand {
  tenantId: string;
  organizationId: string | null;
  name: string;
  slug: string;
  status: 'active' | 'deactivated';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseOrganizationCommand(value: unknown): OrganizationCommand {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestValidationError('Invalid body.');
  const input = value as Record<string, unknown>;
  const tenantId = typeof input.tenantId === 'string' ? input.tenantId : '';
  const organizationId = input.organizationId == null ? null : String(input.organizationId);
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const slug = typeof input.slug === 'string' ? input.slug.trim().toLowerCase() : '';
  const status = input.status;
  if (!UUID.test(tenantId) || (organizationId !== null && !UUID.test(organizationId))) throw new RequestValidationError('Invalid scope.');
  if (name.length < 1 || name.length > 160 || !SLUG.test(slug)) throw new RequestValidationError('Invalid organization.');
  if (status !== 'active' && status !== 'deactivated') throw new RequestValidationError('Invalid status.');
  return { tenantId, organizationId, name, slug, status };
}
