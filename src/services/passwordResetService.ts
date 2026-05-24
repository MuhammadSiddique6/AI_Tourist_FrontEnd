import api from "./api";
import {
  clearPasswordResetSession,
  isEmailOtpVerified,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "./mockPasswordReset";

let useMockOtp = false;

export function isPasswordResetMockActive(): boolean {
  return useMockOtp;
}

function isOfflineError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Network error") ||
    msg.includes("timeout") ||
    msg.includes("Failed to fetch") ||
    msg.includes("AbortError")
  );
}

function extractCode(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const row = res as Record<string, unknown>;
  const raw = row.code ?? row.otp ?? row.otp_code;
  return raw != null ? String(raw) : null;
}

/** Request OTP — uses backend when reachable, otherwise local mock (demo). */
export async function requestPasswordResetOtp(
  email: string,
): Promise<{ code: string | null }> {
  const key = email.trim().toLowerCase();
  try {
    const res = await api.auth.forgotPassword(key);
    useMockOtp = false;
    return { code: extractCode(res) };
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const { code } = await sendPasswordResetOtp(key);
    useMockOtp = true;
    return { code };
  }
}

export async function resendPasswordResetOtp(
  email: string,
): Promise<{ code: string | null }> {
  const key = email.trim().toLowerCase();
  if (useMockOtp) {
    const { code } = await sendPasswordResetOtp(key);
    return { code };
  }
  try {
    const res = await api.auth.resendOtp(key);
    return { code: extractCode(res) };
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const { code } = await sendPasswordResetOtp(key);
    useMockOtp = true;
    return { code };
  }
}

/** Validate OTP before reset screen (mock only; API validates on reset). */
export function verifyOtpForReset(email: string, otp: string): boolean {
  if (!useMockOtp) return true;
  return verifyPasswordResetOtp(email, otp);
}

export async function completePasswordReset(
  email: string,
  otp_code: string,
  password: string,
): Promise<void> {
  const key = email.trim().toLowerCase();
  if (useMockOtp && !isEmailOtpVerified(key)) {
    throw new Error("Invalid or expired verification code. Request a new code.");
  }
  try {
    await api.auth.resetPassword(key, otp_code, password);
    clearPasswordResetSession(key);
    useMockOtp = false;
  } catch (err) {
    if (!useMockOtp || !isOfflineError(err)) throw err;
    throw new Error(
      "Password was verified locally, but the server is offline. Start the backend and try again.",
    );
  }
}
