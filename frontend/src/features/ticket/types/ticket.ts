import type { User } from "../../user/types/user";
import type { Project } from "../../project/types/project";

export const TICKET_STATUSES = [
  "open",
  "inProgress",
  "resolved",
  "closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export type Ticket = {
  id: string;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  project: Project;
  createdBy: User;
  assignees: User[];
  createdAt: string;
  updatedAt: string;
};

export type TicketFilters = {
  title?: string;
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  projectName?: string;
  assignedToMe?: "true" | "false" | null;
};

export type AssignableUser = Pick<
  User,
  "id" | "fullName" | "role" | "email"
> & {
  isMember: boolean;
};

export type TicketDashboard = User & {
  ticketBreakdown: Record<TicketStatus, Record<TicketPriority, number>>;
};
