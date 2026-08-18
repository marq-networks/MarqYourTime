import { useState } from 'react';
import { Lock } from 'lucide-react';
import { submitPasswordReset } from './resetPasswordSubmission';

export function ResetPasswordScreen({ onUpdatePassword }: { onUpdatePassword: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await submitPasswordReset(password, confirmation, onUpdatePassword);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update your password. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
        <header className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-8 py-6 border-b border-border">
          <div className="flex items-center gap-3"><Lock className="h-6 w-6 text-blue-600" /><div><h1 className="text-xl text-foreground">Set a new password</h1><p className="text-sm text-muted-foreground">Complete your secure account recovery.</p></div></div>
        </header>
        <div className="px-8 py-6 space-y-5">
          <label className="block space-y-1.5"><span className="text-sm text-foreground">New Password</span><input aria-label="New Password" type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" /></label>
          <label className="block space-y-1.5"><span className="text-sm text-foreground">Confirm New Password</span><input aria-label="Confirm New Password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(''); }} onKeyDown={(event) => event.key === 'Enter' && void submit()} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm" /></label>
          {error && <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <button type="button" onClick={() => void submit()} disabled={submitting} className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Updating password…' : 'Update Password'}</button>
        </div>
      </section>
    </main>
  );
}
