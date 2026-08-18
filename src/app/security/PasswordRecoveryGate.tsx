import type { ReactNode } from 'react';
import type { AuthMode } from '../contexts/AuthContext';

export function PasswordRecoveryGate({ authMode, recovery, children }: { authMode: AuthMode; recovery: ReactNode; children: ReactNode }) {
  return <>{authMode === 'password_recovery' ? recovery : children}</>;
}
