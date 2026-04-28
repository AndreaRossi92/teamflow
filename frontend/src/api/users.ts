import type { User } from "../types/user";
import { api } from "./axios.instance";

export async function usersList(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data;
}
