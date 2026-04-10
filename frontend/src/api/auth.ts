import axios from "axios";
import type { AuthUser } from "../types/authUser";

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
  await axios.post("/api/auth/logout", {}, { withCredentials: true });
}
