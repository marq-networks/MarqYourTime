import { describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: {} },
}));

import { authModeForEvent, replaceRecoveryPassword } from './authRecovery';

describe('password recovery auth flow', () => {
  it('enters recovery mode on PASSWORD_RECOVERY and is not overwritten by SIGNED_IN', () => {
    const recovering = authModeForEvent('normal', 'PASSWORD_RECOVERY');
    expect(recovering).toBe('password_recovery');
    expect(authModeForEvent(recovering, 'SIGNED_IN')).toBe('password_recovery');
  });

  it('updates the password and signs out the recovery session', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    await replaceRecoveryPassword({ updateUser, signOut } as never, 'password_recovery', { user: {} } as Session, 'new-password');
    expect(updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('requires a recovery session before updating', async () => {
    const updateUser = vi.fn();
    await expect(replaceRecoveryPassword({ updateUser, signOut: vi.fn() } as never, 'normal', null, 'new-password')).rejects.toThrow('recovery session');
    expect(updateUser).not.toHaveBeenCalled();
  });
});
