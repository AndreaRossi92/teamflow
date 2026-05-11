import type { User } from "../../types/user";

export const mockDevUser: User = {
  id: "mock-uuid-dev",
  email: "dev@teamflow.com",
  role: "dev",
  fullName: "Dev User",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockManagerUser: User = {
  id: "mock-uuid-manager",
  email: "manager@teamflow.com",
  role: "manager",
  fullName: "Manager User",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockAdminUser: User = {
  id: "mock-uuid-admin",
  email: "admin@teamflow.com",
  role: "admin",
  fullName: "Admin User",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockUsers: User[] = [mockAdminUser, mockManagerUser, mockDevUser];
