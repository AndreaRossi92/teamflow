import type { PaginatedResponse } from "../../types/paginatedResponse";
import type {
  AssignableUser,
  Ticket,
  TicketDashboard,
  TicketFilters,
  TicketStatus,
} from "./types/ticket";
import type {
  TicketCreateFormValues,
  TicketEditFormValues,
} from "./types/ticketForm";
import type { UserFilters } from "../user/types/user";
import { api } from "../../api/axios.instance";

const PAGE_SIZE = 20;

export async function ticketsList({
  page = 1,
  limit = PAGE_SIZE,
  filters,
}: {
  page?: number;
  limit?: number;
  filters?: TicketFilters;
} = {}): Promise<PaginatedResponse<Ticket>> {
  const params = new URLSearchParams();

  if (filters?.title) params.append("title", filters.title);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.projectId) params.append("projectId", filters.projectId);

  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await api.get(`/tickets?${params.toString()}`);
  return response.data;
}

export async function ticketById(id: string): Promise<Ticket> {
  const response = await api.get<Ticket>(`/tickets/${id}`);
  return response.data;
}

export async function createTicket(
  data: TicketCreateFormValues,
): Promise<Ticket> {
  const { project, ...rest } = data;
  const response = await api.post<Ticket>("/tickets", {
    projectId: project?.id,
    ...rest,
  });
  return response.data;
}

export async function editTicket(
  id: string,
  data: TicketEditFormValues,
): Promise<Ticket> {
  const { project, ...rest } = data;
  const response = await api.patch<Ticket>(`/tickets/${id}`, {
    projectId: project?.id,
    ...rest,
  });
  return response.data;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  const response = await api.patch<Ticket>(`/tickets/${id}/status`, { status });
  return response.data;
}

export async function ticketAssignableUsersList({
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
    `/tickets/${id}/assignable-users?${params.toString()}`,
  );

  return response.data;
}

export async function ticketAssignUsers(
  id: string,
  userIds: string[],
): Promise<Ticket> {
  const response = await api.patch<Ticket>(`/tickets/${id}/assign`, {
    userIds,
  });
  return response.data;
}

export async function deleteTicket(id: string): Promise<void> {
  const response = await api.delete<void>(`/tickets/${id}`);
  return response.data;
}

export async function ticketDashboard(): Promise<TicketDashboard[]> {
  const response = await api.get("/projects/members-workload");
  return response.data;
}

export async function ticketDevDashboard(): Promise<TicketDashboard> {
  const response = await api.get("/users/me/workload");
  return response.data;
}
