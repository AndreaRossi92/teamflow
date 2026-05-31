import type { AssignableUser, Project, ProjectFilters } from "../types/project";
import type {
  ProjectCreateFormValues,
  ProjectEditFormValues,
} from "../types/projectForm";
import type { UserFilters } from "../types/user";
import { api } from "./axios.instance";

const PAGE_SIZE = 20;

export async function projectsList({
  page = 1,
  limit = PAGE_SIZE,
  filters,
}: {
  page?: number;
  limit?: number;
  filters?: ProjectFilters;
} = {}) {
  const params = new URLSearchParams();

  if (filters?.name) params.append("name", filters.name);
  if (typeof filters?.isActive === "boolean")
    params.append("isActive", String(filters.isActive));

  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await api.get(`/projects?${params.toString()}`);

  return response.data;
}

export async function projectById(id: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${id}`);

  return response.data;
}

export async function deactivateProjectById(id: string): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}/deactivate`);

  return response.data;
}

export async function reactivateProjectById(id: string): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}/reactivate`);

  return response.data;
}

export async function createProject(
  data: ProjectCreateFormValues,
): Promise<Project> {
  const response = await api.post<Project>("/projects", data);

  return response.data;
}

export async function editProject(
  id: string,
  data: ProjectEditFormValues,
): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}`, data);

  return response.data;
}

export async function projectAssignableUsersList({
  id,
  filters,
}: {
  id: string;
  filters?: Omit<UserFilters, "isActive">;
}): Promise<AssignableUser[]> {
  const params = new URLSearchParams();

  if (filters?.fullName) params.append("fullName", filters.fullName);
  if (filters?.role) params.append("role", filters.role);

  const response = await api.get(
    `/projects/${id}/assignable-users?${params.toString()}`,
  );

  return response.data;
}

export async function projectAssignUsers(
  id: string,
  userIds: string[],
): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}/assign`, {
    userIds,
  });

  return response.data;
}
