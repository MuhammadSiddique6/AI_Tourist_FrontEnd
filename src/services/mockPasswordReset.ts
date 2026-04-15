type Pending = { otp: string; expiresAt: number };

const pendingByEmail = new Map<string, Pending>();
const otpVerifiedEmails = new Set<string>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSixDigit(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

/** Simulates sending an OTP (returns the code for demo UI only). */
export async function sendPasswordResetOtp(email: string): Promise<{ code: string }> {
  await delay(450 + Math.floor(Math.random() * 400));
  const key = email.trim().toLowerCase();
  otpVerifiedEmails.delete(key);
  const code = randomSixDigit();
  pendingByEmail.set(key, { otp: code, expiresAt: Date.now() + 15 * 60 * 1000 });
  return { code };
}

export function verifyPasswordResetOtp(email: string, input: string): boolean {
  const key = email.trim().toLowerCase();
  const row = pendingByEmail.get(key);
  if (!row) return false;
  if (Date.now() > row.expiresAt) {
    pendingByEmail.delete(key);
    return false;
  }
  if (row.otp !== input.trim()) return false;
  otpVerifiedEmails.add(key);
  pendingByEmail.delete(key);
  return true;
}

export function isEmailOtpVerified(email: string): boolean {
  return otpVerifiedEmails.has(email.trim().toLowerCase());
}

export function clearPasswordResetSession(email: string): void {
  const key = email.trim().toLowerCase();
  pendingByEmail.delete(key);
  otpVerifiedEmails.delete(key);
}
