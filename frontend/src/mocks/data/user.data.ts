import type { User } from "../../features/user/types/user";

export const mockAdminUser: User = {
  id: "user-admin",
  email: "admin@teamflow.com",
  role: "admin",
  fullName: "Admin User",
  isActive: true,
  createdAt: "2024-01-05T09:00:00.000Z",
  updatedAt: "2024-01-05T09:00:00.000Z",
};

export const mockManagerUser: User = {
  id: "user-manager",
  email: "manager@teamflow.com",
  role: "manager",
  fullName: "Manager User",
  isActive: true,
  createdAt: "2024-01-05T09:00:00.000Z",
  updatedAt: "2024-01-05T09:00:00.000Z",
};

export const mockDevUser: User = {
  id: "user-dev",
  email: "dev@teamflow.com",
  role: "dev",
  fullName: "Dev User",
  isActive: true,
  createdAt: "2024-01-05T09:00:00.000Z",
  updatedAt: "2024-01-05T09:00:00.000Z",
};

export const mockManagerUser1: User = {
  id: "user-manager-1",
  email: "sara.bianchi@teamflow.com",
  role: "manager",
  fullName: "Sara Bianchi",
  isActive: true,
  createdAt: "2024-01-10T09:00:00.000Z",
  updatedAt: "2024-01-10T09:00:00.000Z",
};

export const mockManagerUser2: User = {
  id: "user-manager-2",
  email: "marco.rossi@teamflow.com",
  role: "manager",
  fullName: "Marco Rossi",
  isActive: true,
  createdAt: "2024-01-12T09:00:00.000Z",
  updatedAt: "2024-01-12T09:00:00.000Z",
};

export const mockDevUser1: User = {
  id: "user-dev-1",
  email: "giulia.verdi@teamflow.com",
  role: "dev",
  fullName: "Giulia Verdi",
  isActive: true,
  createdAt: "2024-01-15T09:00:00.000Z",
  updatedAt: "2024-01-15T09:00:00.000Z",
};

export const mockDevUser2: User = {
  id: "user-dev-2",
  email: "luca.ferrari@teamflow.com",
  role: "dev",
  fullName: "Luca Ferrari",
  isActive: true,
  createdAt: "2024-01-16T09:00:00.000Z",
  updatedAt: "2024-01-16T09:00:00.000Z",
};

export const mockDevUser3: User = {
  id: "user-dev-3",
  email: "elena.romano@teamflow.com",
  role: "dev",
  fullName: "Elena Romano",
  isActive: true,
  createdAt: "2024-01-18T09:00:00.000Z",
  updatedAt: "2024-01-18T09:00:00.000Z",
};

export const mockDevUser4: User = {
  id: "user-dev-4",
  email: "davide.conti@teamflow.com",
  role: "dev",
  fullName: "Davide Conti",
  isActive: true,
  createdAt: "2024-01-20T09:00:00.000Z",
  updatedAt: "2024-01-20T09:00:00.000Z",
};

export const mockDevUser5: User = {
  id: "user-dev-5",
  email: "chiara.galli@teamflow.com",
  role: "dev",
  fullName: "Chiara Galli",
  isActive: false,
  createdAt: "2024-01-22T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
};

export const mockUsers: User[] = [
  mockAdminUser,
  mockManagerUser1,
  mockManagerUser2,
  mockDevUser1,
  mockDevUser2,
  mockDevUser3,
  mockDevUser4,
  mockDevUser5,
];

function getMaxUserNumber(): number {
  return mockUsers.reduce((max, u) => {
    const n = Number(u.id.replace("user-", ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
}

let userIdCounter = getMaxUserNumber();
export function generateUserId(): string {
  userIdCounter += 1;
  return `user-${userIdCounter}`;
}
