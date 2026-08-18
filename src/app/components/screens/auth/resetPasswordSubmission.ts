const MIN_PASSWORD_LENGTH = 8;

export async function submitPasswordReset(password: string, confirmation: string, updatePassword: (password: string) => Promise<void>) {
  if (!password || !confirmation) throw new Error('Enter and confirm your new password.');
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (password !== confirmation) throw new Error('Passwords do not match.');
  await updatePassword(password);
}
