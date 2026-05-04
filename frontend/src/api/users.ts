import { type User } from "../types/user";
import { api } from "./axios.instance";

const PAGE_SIZE = 20;

export async function usersList({
  page = 1,
  limit = PAGE_SIZE,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<User[]> {
  const response = await api.get("/users", {
    params: { page, limit },
  });

  return response.data.data;
}

export async function userById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);

  return response.data;
}
