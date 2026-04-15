import type { FieldErrors, LoginCredentials, RegisterPayload } from "../types/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(credentials: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {};
  if (!credentials.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(credentials.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!credentials.password) {
    errors.password = "Password is required.";
  } else if (credentials.password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }
  return errors;
}

export function validateRegister(payload: RegisterPayload): FieldErrors {
  const errors = validateLogin(payload);
  if (!payload.displayName.trim()) {
    errors.displayName = "Name is required.";
  } else if (payload.displayName.trim().length < 2) {
    errors.displayName = "Name should be at least 2 characters.";
  }
  return errors;
}

export function validateForgotEmail(email: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

export function validateOtpInput(otp: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!otp.trim()) {
    errors.otp = "Verification code is required.";
  } else if (!/^\d{6}$/.test(otp.trim())) {
    errors.otp = "Enter the 6-digit code.";
  }
  return errors;
}

export function validatePasswordReset(password: string, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}
