import type { AdminUser, ApiAdminUser } from "../types/admin";
import api from "./api";

function parseUserList(data: unknown): ApiAdminUser[] {
  if (Array.isArray(data)) return data as ApiAdminUser[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.users)) return obj.users as ApiAdminUser[];
    if (Array.isArray(obj.data)) return obj.data as ApiAdminUser[];
  }
  return [];
}

export function mapApiAdminUser(raw: ApiAdminUser): AdminUser {
  return {
    id: String(raw.id),
    name: raw.name ?? raw.email.split("@")[0],
    email: raw.email,
    role: raw.role ?? "user",
    isBlocked: Boolean(raw.blocked),
    isVerified: Boolean(raw.is_verified),
    createdAt: raw.createdAt,
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const data = await api.admin.getUsers();
  return parseUserList(data).map(mapApiAdminUser);
}

export async function setUserBlocked(
  userId: string,
  blocked: boolean,
): Promise<void> {
  if (blocked) {
    await api.admin.blockUser(userId);
  } else {
    await api.admin.unblockUser(userId);
  }
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await api.admin.deleteUser(userId);
}
