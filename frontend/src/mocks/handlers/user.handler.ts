import { http, HttpResponse, delay } from "msw";
import { mockUsers } from "../data/user.data";
import type { User } from "../../features/user/types/user";
import {
  getMockUserWorkload,
  mockUsersBreakdown,
} from "../data/dashboard.data";
import { mockAdminUser } from "../data/auth.data";

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

  http.get("/api/users/me/workload", async () => {
    await delay(400);
    const workload = getMockUserWorkload(mockAdminUser.id);
    return HttpResponse.json(workload);
  }),

  http.get("/api/users/breakdown", async () => {
    await delay(300);
    return HttpResponse.json(mockUsersBreakdown);
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

  http.post<never, Partial<User>>("/api/users", async ({ request }) => {
    await delay(500);
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      id: "mock-uuid-dev",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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

  http.patch<{ id: string }, { newPassword: string }>(
    "/api/users/:id/reset-password",
    async ({ params }) => {
      await delay(500);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          { message: "User not found", error: "Not Found", statusCode: 404 },
          { status: 404 },
        );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete<{ id: string }>("/api/users/:id", async ({ params }) => {
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
    return HttpResponse.json();
  }),
];
