import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export type AuthMode = 'normal' | 'password_recovery';

export function authModeForEvent(currentMode: AuthMode, event: AuthChangeEvent): AuthMode {
  if (event === 'PASSWORD_RECOVERY') return 'password_recovery';
  if (event === 'SIGNED_OUT') return 'normal';
  return currentMode;
}

type PasswordAuthClient = Pick<typeof supabase.auth, 'updateUser' | 'signOut'>;

export async function replaceRecoveryPassword(auth: PasswordAuthClient, mode: AuthMode, session: Session | null, newPassword: string) {
  if (mode !== 'password_recovery' || !session) throw new Error('Your password recovery session is no longer valid. Request a new recovery link.');
  const { error } = await auth.updateUser({ password: newPassword });
  if (error) throw new Error('Unable to update your password. Request a new recovery link and try again.');
  const { error: signOutError } = await auth.signOut();
  if (signOutError) throw new Error('Password updated, but sign out failed. Please try again.');
}
