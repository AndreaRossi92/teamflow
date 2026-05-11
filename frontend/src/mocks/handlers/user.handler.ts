import { http, HttpResponse, delay } from "msw";
import { mockUsers } from "../data/user.data";
import type { User } from "../../types/user";

export const userHandlers = [
  http.get("/api/users", async () => {
    await delay(500);
    return HttpResponse.json({
      count: mockUsers.length,
      total: mockUsers.length,
      page: 1,
      pageCount: 1,
      data: mockUsers,
    });
  }),

  http.get<{ id: string }>("/api/users/:id", async ({ params }) => {
    await delay(300);
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user)
      return HttpResponse.json(
        {
          message: "User not found",
          error: "Not Found",
          statusCode: 404,
        },
        { status: 404 },
      );
    return HttpResponse.json(user);
  }),

  http.patch<{ id: string }, Partial<User>>(
    "/api/users/:id",
    async ({ params, request }) => {
      await delay(500);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          {
            message: "User not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      const body = await request.json();
      return HttpResponse.json({ ...user, ...body, updatedAt: new Date() });
    },
  ),

  http.patch<{ id: string }>(
    "/api/users/:id/deactivate",
    async ({ params }) => {
      await delay(400);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          {
            message: "User not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      return HttpResponse.json({ ...user, isActive: false });
    },
  ),

  http.patch<{ id: string }>(
    "/api/users/:id/reactivate",
    async ({ params }) => {
      await delay(400);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          {
            message: "User not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      return HttpResponse.json({ ...user, isActive: true });
    },
  ),
];
