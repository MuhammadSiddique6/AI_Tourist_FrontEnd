export interface AuthUser {
  email: string;
  displayName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  displayName: string;
}

export type FieldErrors = Partial<
  Record<"email" | "password" | "displayName" | "otp" | "confirmPassword", string>
>;
