import type { User } from "./user";

export type Project = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectFilters = {
  name: string;
  isActive: boolean | null;
};

export type AssignableUser = Pick<
  User,
  "id" | "fullName" | "role" | "email"
> & {
  isMember: boolean;
};
