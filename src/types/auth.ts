export interface AuthUser {
  id?: string;
  email: string;
  displayName: string;
  role?: string;
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user?.role) return false;
  return user.role.toLowerCase() === "admin";
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
