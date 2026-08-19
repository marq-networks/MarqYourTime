import { describe, expect, it, vi } from 'vitest';
import { requestPasswordRecovery, safeSignInError } from './authOperations';

describe('bounded authentication errors', () => {
  it('does not expose provider details for invalid credentials', () => {
    const error = safeSignInError({ status: 400, code: 'invalid_credentials' });
    expect(error.message).toBe('Unable to sign in with those credentials. Check your details and try again.');
    expect(error.message).not.toContain('invalid_credentials');
  });

  it('provides bounded rate-limit guidance', () => {
    expect(safeSignInError({ status: 429, code: 'over_request_rate_limit' }).message).toContain('Too many sign-in attempts');
  });

  it('normalizes the recovery email and uses the explicit redirect', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    await requestPasswordRecovery({ resetPasswordForEmail } as never, ' USER@Example.com ', 'https://work.example/reset-password');
    expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', { redirectTo: 'https://work.example/reset-password' });
  });

  it('does not leak provider recovery errors', async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: { status: 500, code: 'unexpected', message: 'private provider detail' } });
    await expect(requestPasswordRecovery({ resetPasswordForEmail } as never, 'user@example.com', 'https://work.example/reset-password'))
      .rejects.toThrow('Unable to request a recovery link right now. Please try again.');
  });
});
