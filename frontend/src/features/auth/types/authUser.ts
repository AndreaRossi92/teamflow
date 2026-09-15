import type { Role } from "../../user/types/user";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  fullName: string;
};
