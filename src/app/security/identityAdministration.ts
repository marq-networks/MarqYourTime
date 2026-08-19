import type { LaunchRole } from './types';

export interface InviteMemberInput {
  email: string;
  tenantId: string;
  organizationId: string;
  role: Exclude<LaunchRole, 'platform_admin'> | 'platform_admin';
}

export async function inviteMember(input: InviteMemberInput): Promise<void> {
  const { supabase } = await import('../../lib/supabase');
  const { error } = await supabase.functions.invoke('identity-administration', {
    body: { action: 'invite', ...input },
  });
  if (error) throw new Error('The invitation could not be created.');
}
