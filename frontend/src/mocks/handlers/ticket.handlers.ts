import { http, HttpResponse, delay } from "msw";
import { generateTicketId, mockTickets } from "../data/ticket.data";
import type { Ticket } from "../../features/ticket/types/ticket";
import { mockAdminUser, mockUsers } from "../data/user.data";
import { mockProject1 } from "../data/project.data";

export const ticketHandlers = [
  http.get("/api/tickets", async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockTickets,
      total: mockTickets.length,
      page: 1,
      limit: mockTickets.length,
      hasNextPage: false,
    });
  }),

  http.get<{ id: string }>("/api/tickets/:id", async ({ params }) => {
    await delay(300);
    const ticket = mockTickets.find((u) => u.id === params.id);
    if (!ticket)
      return HttpResponse.json(
        {
          message: "Ticket not found",
          error: "Not Found",
          statusCode: 404,
        },
        { status: 404 },
      );
    return HttpResponse.json(ticket);
  }),

  http.post<never, Partial<Ticket>>("/api/tickets", async ({ request }) => {
    await delay(500);
    const body = await request.json();

    if (!body.title?.trim() || !body.description?.trim()) {
      return HttpResponse.json(
        {
          message: "title and description are required",
          error: "Bad Request",
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const newTicket: Ticket = {
      id: generateTicketId(),
      title: body.title,
      description: body.description,
      project: body.project ?? mockProject1,
      assignees: body.assignees ?? [],
      priority: body.priority ?? "low",
      status: "open",
      createdBy: mockAdminUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTickets.push(newTicket);
    return HttpResponse.json(newTicket, { status: 201 });
  }),

  http.patch<{ id: string }, Partial<Ticket>>(
    "/api/tickets/:id",
    async ({ params, request }) => {
      await delay(500);
      const ticket = mockTickets.find((u) => u.id === params.id);
      if (!ticket)
        return HttpResponse.json(
          {
            message: "Ticket not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      const body = await request.json();
      const {
        id: _id,
        createdBy: _createdBy,
        createdAt: _createdAt,
        status: _status,
        assignees: _assignees,
        ...safeBody
      } = body;
      Object.assign(ticket, safeBody, { updatedAt: new Date().toISOString() });
      return HttpResponse.json(ticket);
    },
  ),

  http.get<{ id: string }>(
    "/api/tickets/:id/assignable-users",
    async ({ params }) => {
      await delay(500);
      const ticket = mockTickets.find((u) => u.id === params.id);
      if (!ticket)
        return HttpResponse.json(
          {
            message: "Ticket not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );

      return HttpResponse.json(
        mockUsers.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          isMember: ticket.assignees.map((u) => u.id).includes(user.id),
        })),
      );
    },
  ),

  http.patch<{ id: string }, { userIds: string[] }>(
    "/api/tickets/:id/assign",
    async ({ params, request }) => {
      await delay(500);
      const ticket = mockTickets.find((u) => u.id === params.id);
      if (!ticket)
        return HttpResponse.json(
          {
            message: "Ticket not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      const body = await request.json();
      Object.assign(ticket, {
        assignees: mockUsers.filter((user) => body.userIds.includes(user.id)),
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(ticket);
    },
  ),

  http.patch<{ id: string }, { status: string }>(
    "/api/tickets/:id/status",
    async ({ params, request }) => {
      await delay(300);
      const ticket = mockTickets.find((t) => t.id === params.id);
      if (!ticket)
        return HttpResponse.json(
          { message: "Ticket not found", error: "Not Found", statusCode: 404 },
          { status: 404 },
        );
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
    const index = mockTickets.findIndex((u) => u.id === params.id);
    if (index === -1)
      return HttpResponse.json(
        {
          message: "Ticket not found",
          error: "Not Found",
          statusCode: 404,
        },
        { status: 404 },
      );
    mockTickets.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
