import type { PaginatedResponse } from "../types/paginatedResponse";
import { type User, type UserFilters } from "../types/user";
import type {
  UserCreateFormValues,
  UserEditFormValues,
} from "../types/userForm";
import { api } from "./axios.instance";

const PAGE_SIZE = 20;

export async function usersList({
  page = 1,
  limit = PAGE_SIZE,
  filters,
}: {
  page?: number;
  limit?: number;
  filters?: UserFilters;
} = {}): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams();

  if (filters?.role) params.append("role", filters.role);
  if (filters?.fullName) params.append("fullName", filters.fullName);
  if (typeof filters?.isActive === "boolean")
    params.append("isActive", String(filters.isActive));

  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await api.get(`/users?${params.toString()}`);

  return response.data;
}

export async function userById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);

  return response.data;
}

export async function deactivateUserById(id: string): Promise<User> {
  const response = await api.patch<User>(`/users/${id}/deactivate`);

  return response.data;
}

export async function reactivateUserById(id: string): Promise<User> {
  const response = await api.patch<User>(`/users/${id}/reactivate`);

  return response.data;
}

export async function createUser(
  data: Omit<UserCreateFormValues, "confirmPassword">,
): Promise<User> {
  const response = await api.post<User>("/users", data);

  return response.data;
}

export async function editUser(
  id: string,
  data: UserEditFormValues,
): Promise<User> {
  const response = await api.patch<User>(`/users/${id}`, data);

  return response.data;
}

export async function resetPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  const response = await api.patch<void>(`/users/${id}/reset-password`, {
    newPassword,
  });
  return response.data;
}
