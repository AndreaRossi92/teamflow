import axios from "axios";
import type { AuthUser } from "../types/authUser";
import { api } from "./axios.instance";

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await axios.post<{ user: AuthUser }>(
    "/api/auth/login",
    { email, password },
    { withCredentials: true },
  );
  return response.data.user;
}

export async function refreshToken(): Promise<AuthUser> {
  const response = await axios.post<{ user: AuthUser }>(
    "/api/auth/refresh",
    {},
    { withCredentials: true },
  );
  return response.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout", {}, { withCredentials: true });
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
