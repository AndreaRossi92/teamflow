import { http, HttpResponse, delay } from "msw";
import { mockTickets } from "../data/ticket.data";
import type { Ticket } from "../../features/ticket/types/ticket";
import { mockUsers } from "../data/user.data";

export const ticketHandlers = [
  http.get("/api/tickets", async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockTickets,
      total: mockTickets.length,
      page: 1,
      limit: 20,
      hasNexPage: false,
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
    return HttpResponse.json({
      ...body,
      id: "mock-uuid-ticket-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
      return HttpResponse.json({ ...ticket, ...body, updatedAt: new Date() });
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
      return HttpResponse.json({
        ...ticket,
        members: mockUsers.filter((user) => body.userIds.includes(user.id)),
        updatedAt: new Date(),
      });
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
      return HttpResponse.json({
        ...ticket,
        status: body.status ?? ticket.status,
        updatedAt: new Date(),
      });
    },
  ),

  http.delete<{ id: string }>("/api/tickets/:id", async ({ params }) => {
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
    return HttpResponse.json();
  }),
];
