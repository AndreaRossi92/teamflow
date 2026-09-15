import type { Role as RoleType } from "../types/user";

export const Role: Record<"ADMIN" | "MANAGER" | "DEV", RoleType> = {
  ADMIN: "admin",
  MANAGER: "manager",
  DEV: "dev",
};

export const ROLE_COLOR: Record<RoleType, RoleType> = {
  admin: "admin",
  manager: "manager",
  dev: "dev",
};

export const ACTIVE_COLOR: Record<"active" | "inactive", "success" | "error"> =
  {
    active: "success",
    inactive: "error",
  };
