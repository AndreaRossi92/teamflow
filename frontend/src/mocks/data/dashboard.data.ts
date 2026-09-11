import { mockTickets } from "./ticket.data";
import { mockProjects } from "./project.data";
import { mockUsers } from "./user.data";
import type { Project } from "../../features/project/types/project";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../../features/ticket/types/ticket";
import type { User } from "../../features/user/types/user";

const STATUSES: TicketStatus[] = ["open", "inProgress", "resolved", "closed"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high"];
const ROLES: User["role"][] = ["admin", "manager", "dev"];

type TicketBreakdown = Record<TicketStatus, Record<TicketPriority, number>>;

export function emptyTicketBreakdown(): TicketBreakdown {
  return STATUSES.reduce((acc, status) => {
    acc[status] = PRIORITIES.reduce(
      (pAcc, priority) => ({ ...pAcc, [priority]: 0 }),
      {} as Record<TicketPriority, number>,
    );
    return acc;
  }, {} as TicketBreakdown);
}

function addToBreakdown(breakdown: TicketBreakdown, ticket: Ticket) {
  breakdown[ticket.status][ticket.priority] += 1;
}

function breakdownForTickets(tickets: Ticket[]): TicketBreakdown {
  const breakdown = emptyTicketBreakdown();
  tickets.forEach((t) => addToBreakdown(breakdown, t));
  return breakdown;
}

function findProjectsForWorkload(user: User): Project[] {
  const activeProjects = mockProjects.filter((p) => p.isActive);
  if (user.role === "admin") return activeProjects;
  return activeProjects.filter((p) => p.members.some((m) => m.id === user.id));
}

export function getProjectsWorkload(user: User) {
  const projects = findProjectsForWorkload(user);
  const activeProjectIds = new Set(projects.map((p) => p.id));

  return projects.map((project) => {
    if (!activeProjectIds.has(project.id)) {
      return { ...project, ticketBreakdown: emptyTicketBreakdown() };
    }

    const projectTickets = mockTickets.filter(
      (t) => t.project.id === project.id,
    );
    const relevantTickets =
      user.role === "dev"
        ? projectTickets.filter((t) =>
            t.assignees.some((a) => a.id === user.id),
          )
        : projectTickets;

    return {
      ...project,
      ticketBreakdown: breakdownForTickets(relevantTickets),
    };
  });
}

export function getMembersWorkload(
  user: User,
): Array<User & { ticketBreakdown: TicketBreakdown }> {
  const projects = findProjectsForWorkload(user);

  const memberMap = new Map<string, User>();
  projects.forEach((p) =>
    p.members.forEach((m) => {
      if (m.isActive) memberMap.set(m.id, m);
    }),
  );

  const activeProjectIds = new Set(
    projects.filter((p) => p.isActive).map((p) => p.id),
  );

  return [...memberMap.values()].map((member) => ({
    ...member,
    ticketBreakdown: breakdownForTickets(
      mockTickets.filter(
        (t) =>
          activeProjectIds.has(t.project.id) &&
          t.assignees.some((a) => a.id === member.id),
      ),
    ),
  }));
}

export function getMockUserWorkload(userId: string) {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return null;

  return {
    ...user,
    ticketBreakdown: breakdownForTickets(
      mockTickets.filter(
        (t) => t.project.isActive && t.assignees.some((a) => a.id === userId),
      ),
    ),
  };
}

export function getUsersBreakdown() {
  return ROLES.map((role) => {
    const usersWithRole = mockUsers.filter((u) => u.role === role);
    return {
      role,
      active: usersWithRole.filter((u) => u.isActive).length,
      inactive: usersWithRole.filter((u) => !u.isActive).length,
    };
  });
}
