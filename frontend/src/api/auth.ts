import type { AuthUser } from "../types/authUser";
import { api } from "./axios.instance";

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await api.post<{ user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return response.data.user;
}

export async function refreshToken(): Promise<AuthUser> {
  const response = await api.post<{ user: AuthUser }>("/auth/refresh", {});
  return response.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const response = await api.post<{ user: AuthUser }>("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data.user;
}
