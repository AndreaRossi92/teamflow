import type { AuthUser } from "../../features/auth/types/authUser";

export const mockAdminUser: AuthUser = {
  id: "mock-uuid-admin",
  email: "admin@teamflow.com",
  role: "admin",
  fullName: "Admin",
};
