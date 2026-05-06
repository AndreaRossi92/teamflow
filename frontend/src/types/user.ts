export const ROLES = ["admin", "manager", "dev"] as const;
export type Role = (typeof ROLES)[number];

export type User = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
};

export type UserFilters = {
  role: Role | null;
  fullName: string;
  isActive: boolean | null;
};
