import { http, HttpResponse, delay } from "msw";
import { generateTicketId, mockTickets } from "../data/ticket.data";
import type { Ticket } from "../../features/ticket/types/ticket";
import type { Project } from "../../features/project/types/project";
import type { User } from "../../features/user/types/user";
import { mockUsers } from "../data/user.data";
import { mockProjects } from "../data/project.data";
import {
  type ErrorResponse,
  isErrorResponse,
  requireRole,
  requireUser,
} from "../handlers/guards";
import { badRequest, forbidden, notFound } from "../data/http.errors";

function findProjectWithAccess(
  id: string,
  currentUser: User,
): Project | ErrorResponse {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return notFound("Project not found");

  if (
    currentUser.role !== "admin" &&
    !project.members.some((m) => m.id === currentUser.id)
  ) {
    return forbidden();
  }

  return project;
}

function findTicketWithAccess(
  id: string,
  currentUser: User,
  options: { requireManagerAccess?: boolean } = {},
): Ticket | ErrorResponse {
  const ticket = mockTickets.find((t) => t.id === id);
  if (!ticket) return notFound("Ticket not found");

  if (currentUser.role === "admin") return ticket;

  const project = mockProjects.find((p) => p.id === ticket.project.id);
  if (!project) return notFound("Project not found");

  const isProjectMember = project.members.some((m) => m.id === currentUser.id);
  if (!isProjectMember) return forbidden();

  if (options.requireManagerAccess && currentUser.role === "dev") {
    return forbidden();
  }

  return ticket;
}

export const ticketHandlers = [
  http.get("/api/tickets", async ({ request }) => {
    await delay(500);
    const auth = requireUser();
    if (isErrorResponse(auth)) return auth;
    const currentUser = auth;

    const url = new URL(request.url);
    const title = url.searchParams.get("title") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const priority = url.searchParams.get("priority") ?? undefined;
    const projectName = url.searchParams.get("projectName") ?? undefined;
    const assignedToMeParam = url.searchParams.get("assignedToMe");
    const assignedToMe =
      assignedToMeParam === null ? undefined : assignedToMeParam === "true";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    let filtered = mockTickets.filter((t) => t.project.isActive);

    if (currentUser.role === "manager") {
      filtered = filtered.filter((t) =>
        t.project.members.some((m) => m.id === currentUser.id),
      );
    } else if (currentUser.role === "dev") {
      filtered = filtered.filter((t) =>
        t.assignees.some((a) => a.id === currentUser.id),
      );
    }

    if (assignedToMe !== undefined) {
      filtered = filtered.filter((t) =>
        assignedToMe
          ? t.assignees.some((a) => a.id === currentUser.id)
          : !t.assignees.some((a) => a.id === currentUser.id),
      );
    }

    if (title) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(title.toLowerCase()),
      );
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    if (projectName) {
      filtered = filtered.filter((t) =>
        t.project.name.toLowerCase().includes(projectName.toLowerCase()),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = [...filtered]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(start, start + limit);

    return HttpResponse.json({
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    });
  }),

  http.get<{ id: string }>("/api/tickets/:id", async ({ params }) => {
    await delay(300);
    const auth = requireUser();
    if (isErrorResponse(auth)) return auth;

    const result = findTicketWithAccess(params.id, auth);
    if (isErrorResponse(result)) return result;

    return HttpResponse.json(result);
  }),

  http.post<never, Partial<Omit<Ticket, "project">> & { projectId: string }>(
    "/api/tickets",
    async ({ request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;
      const currentUser = auth;

      const body = await request.json();

      if (!body.title?.trim() || !body.description?.trim()) {
        return badRequest("title and description are required");
      }

      const projectResult = findProjectWithAccess(body.projectId, currentUser);
      if (isErrorResponse(projectResult)) return projectResult;
      const project = projectResult;

      const newTicket: Ticket = {
        id: generateTicketId(),
        title: body.title,
        description: body.description,
        project,
        priority: body.priority ?? "low",
        assignees: [currentUser],
        status: "open",
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTickets.push(newTicket);
      return HttpResponse.json(newTicket, { status: 201 });
    },
  ),

  http.patch<{ id: string }, Partial<Ticket> & { projectId?: string }>(
    "/api/tickets/:id",
    async ({ params, request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;
      const currentUser = auth;

      const result = findTicketWithAccess(params.id, currentUser, {
        requireManagerAccess: true,
      });
      if (isErrorResponse(result)) return result;
      const ticket = result;

      const body = await request.json();

      if (
        body.projectId !== undefined &&
        body.projectId !== ticket.project.id
      ) {
        const newProjectResult = findProjectWithAccess(
          body.projectId,
          currentUser,
        );
        if (isErrorResponse(newProjectResult)) return newProjectResult;

        ticket.assignees = [currentUser];
        ticket.project = newProjectResult;
      }

      const {
        id: _id,
        createdBy: _createdBy,
        createdAt: _createdAt,
        status: _status,
        assignees: _assignees,
        projectId: _projectId,
        project: _project,
        ...safeBody
      } = body as Record<string, unknown>;
      Object.assign(ticket, safeBody, { updatedAt: new Date().toISOString() });
      return HttpResponse.json(ticket);
    },
  ),

  http.get<{ id: string }>(
    "/api/tickets/:id/assignable-users",
    async ({ params, request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const ticketResult = findTicketWithAccess(params.id, auth);
      if (isErrorResponse(ticketResult)) return ticketResult;
      const ticket = ticketResult;

      const project = mockProjects.find((p) => p.id === ticket.project.id);
      if (!project) return notFound("Project not found");

      const url = new URL(request.url);
      const fullName = url.searchParams.get("fullName") ?? undefined;
      const role = url.searchParams.get("role") ?? undefined;
      const assigneeIds = new Set(ticket.assignees.map((u) => u.id));

      const result = project.members
        .filter(
          (u) =>
            u.isActive &&
            (!fullName ||
              u.fullName.toLowerCase().includes(fullName.toLowerCase())) &&
            (!role || u.role === role),
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isMember: assigneeIds.has(user.id),
        }));

      return HttpResponse.json(result);
    },
  ),

  http.patch<{ id: string }, { userIds: string[] }>(
    "/api/tickets/:id/assign",
    async ({ params, request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const ticketResult = findTicketWithAccess(params.id, auth, {
        requireManagerAccess: true,
      });
      if (isErrorResponse(ticketResult)) return ticketResult;
      const ticket = ticketResult;

      const projectResult = findProjectWithAccess(ticket.project.id, auth);
      if (isErrorResponse(projectResult)) return projectResult;
      const project = projectResult;

      const body = await request.json();

      if (body.userIds.length > 0) {
        const users = mockUsers.filter((u) => body.userIds.includes(u.id));
        if (users.length !== body.userIds.length) {
          return notFound("User not found");
        }

        const memberIds = new Set(project.members.map((m) => m.id));
        const nonMembers = users.filter((u) => !memberIds.has(u.id));
        if (nonMembers.length > 0) {
          return badRequest("One or more users are not project members");
        }

        ticket.assignees = users;
      } else {
        ticket.assignees = [];
      }

      ticket.updatedAt = new Date().toISOString();
      return HttpResponse.json(ticket);
    },
  ),

  http.patch<{ id: string }, { status: string }>(
    "/api/tickets/:id/status",
    async ({ params, request }) => {
      await delay(300);
      const auth = requireUser();
      if (isErrorResponse(auth)) return auth;

      const result = findTicketWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const ticket = result;

      if (auth.role === "dev") {
        const isAssignee = ticket.assignees.some((a) => a.id === auth.id);
        if (!isAssignee) return forbidden();
      }

      const body = await request.json();
      Object.assign(ticket, {
        status: body.status ?? "open",
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(ticket);
    },
  ),

  http.delete<{ id: string }>("/api/tickets/:id", async ({ params }) => {
    await delay(300);
    const auth = requireRole("admin", "manager");
    if (isErrorResponse(auth)) return auth;

    const result = findTicketWithAccess(params.id, auth, {
      requireManagerAccess: true,
    });
    if (isErrorResponse(result)) return result;
    const ticket = result;

    const index = mockTickets.findIndex((t) => t.id === ticket.id);
    mockTickets.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
