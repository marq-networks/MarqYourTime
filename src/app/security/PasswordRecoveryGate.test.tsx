import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PasswordRecoveryGate } from './PasswordRecoveryGate';

describe('PasswordRecoveryGate', () => {
  it('renders password recovery instead of protected application content', () => {
    const markup = renderToStaticMarkup(<PasswordRecoveryGate authMode="password_recovery" recovery={<p>Reset Password</p>}><p>Protected application</p></PasswordRecoveryGate>);
    expect(markup).toContain('Reset Password');
    expect(markup).not.toContain('Protected application');
  });
});
