import type { Ticket } from "../../types/ticket";
import { mockProject1, mockProject2 } from "./project.data";
import { mockDevUser, mockManagerUser } from "./user.data";

export const mockTicket1: Ticket = {
  id: "mock-uuid-ticket-1",
  title: "Ticket 1",
  description: "Ticket 1 description",
  status: "open",
  priority: "medium",
  project: mockProject1,
  createdBy: mockManagerUser,
  assignees: [mockManagerUser, mockDevUser],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockTicket2: Ticket = {
  id: "mock-uuid-ticket-2",
  title: "Ticket 2",
  description: "Ticket 2 description",
  status: "resolved",
  priority: "high",
  project: mockProject2,
  createdBy: mockManagerUser,
  assignees: [mockManagerUser],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockTickets: Ticket[] = [mockTicket1, mockTicket2];
