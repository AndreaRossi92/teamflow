import type { Role } from "../types/user";

export const ROLE_COLOR: Record<Role, "admin" | "manager" | "dev"> = {
  admin: "admin",
  manager: "manager",
  dev: "dev",
};

export const ACTIVE_COLOR: Record<"active" | "inactive", "success" | "error"> =
  {
    active: "success",
    inactive: "error",
  };
