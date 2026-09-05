import type { User } from "../../features/user/types/user";

let currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function setCurrentUser(user: User | null): void {
  currentUser = user;
}

export function clearCurrentUser(): void {
  currentUser = null;
}
