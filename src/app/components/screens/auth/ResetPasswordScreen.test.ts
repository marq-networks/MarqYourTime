import { describe, expect, it, vi } from 'vitest';
import { submitPasswordReset } from './resetPasswordSubmission';

describe('ResetPasswordScreen submission', () => {
  it('does not submit mismatched passwords', async () => {
    const updatePassword = vi.fn<() => Promise<{ passwordUpdated: true; signedOut: boolean }>>();
    await expect(submitPasswordReset('long-password', 'different-password', updatePassword)).rejects.toThrow('Passwords do not match');
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it('returns the accepted update and cleanup outcome to the screen', async () => {
    const outcome = { passwordUpdated: true as const, signedOut: false };
    const updatePassword = vi.fn().mockResolvedValue(outcome);
    await expect(submitPasswordReset('long-password', 'long-password', updatePassword)).resolves.toEqual(outcome);
  });

  it('submits a valid new password', async () => {
    const updatePassword = vi.fn().mockResolvedValue(undefined);
    await submitPasswordReset('long-password', 'long-password', updatePassword);
    expect(updatePassword).toHaveBeenCalledWith('long-password');
  });
});
