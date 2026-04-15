/** In-memory demo store so login can require the latest password after register / reset. */
const passwordsByEmail = new Map<string, string>();

export function savePasswordForEmail(email: string, password: string): void {
  passwordsByEmail.set(email.trim().toLowerCase(), password);
}

export function passwordMatches(email: string, password: string): boolean {
  const key = email.trim().toLowerCase();
  if (!passwordsByEmail.has(key)) return true;
  return passwordsByEmail.get(key) === password;
}
