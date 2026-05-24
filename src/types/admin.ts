export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt?: string;
}

/** Matches Sequelize User from GET /admin/users */
export interface ApiAdminUser {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
  blocked?: boolean;
  is_verified?: boolean;
  createdAt?: string;
}
