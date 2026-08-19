import { createClient } from 'npm:@supabase/supabase-js@2';
import { RequestValidationError } from '../_shared/invitationPolicy.ts';
import { parseOrganizationCommand } from '../_shared/organizationPolicy.ts';

const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info', 'content-type': 'application/json' };
const reply = (status: number, code: string, message: string, data: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ code, message, ...data }), { status, headers });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'access-control-allow-methods': 'POST' } });
  if (request.method !== 'POST') return reply(405, 'METHOD_NOT_ALLOWED', 'Only POST is supported.');
  const bearer = request.headers.get('authorization');
  if (!bearer?.startsWith('Bearer ')) return reply(401, 'AUTH_REQUIRED', 'A valid authenticated session is required.');
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return reply(503, 'SERVICE_UNAVAILABLE', 'Organization administration is unavailable.');
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(bearer.slice(7));
  if (authError || !user) return reply(401, 'AUTH_REQUIRED', 'A valid authenticated session is required.');
  let command;
  try { command = parseOrganizationCommand(await request.json()); }
  catch (error) {
    if (error instanceof RequestValidationError || error instanceof SyntaxError) return reply(400, 'INVALID_REQUEST', 'The organization request is invalid.');
    return reply(500, 'REQUEST_FAILED', 'The request could not be completed.');
  }
  const correlationId = crypto.randomUUID();
  const { data, error } = await admin.rpc('trusted_manage_organization', {
    p_actor_user_id: user.id, p_tenant_id: command.tenantId, p_organization_id: command.organizationId,
    p_name: command.name, p_slug: command.slug, p_status: command.status, p_correlation_id: correlationId,
  });
  if (error) return reply(403, 'ORGANIZATION_DENIED', 'The organization operation is not permitted.');
  return reply(command.organizationId ? 200 : 201, 'ORGANIZATION_SAVED', 'Organization saved.', { organizationId: data, correlationId });
});
