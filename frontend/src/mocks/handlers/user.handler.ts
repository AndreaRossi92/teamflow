import { http, HttpResponse, delay } from "msw";
import { mockUsers, generateUserId } from "../data/user.data";
import type { User } from "../../features/user/types/user";
import { getMockUserWorkload, getUsersBreakdown } from "../data/dashboard.data";
import { mockAdminUser } from "../data/user.data";
import type { ResetPasswordFormValues } from "../../features/auth/types/resetPasswordForm";

export const userHandlers = [
  http.get("/api/users", async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: mockUsers.length,
      hasNextPage: false,
    });
  }),

  http.get("/api/users/me/workload", async () => {
    await delay(400);
    return HttpResponse.json(getMockUserWorkload(mockAdminUser.id));
  }),

  http.get("/api/users/breakdown", async () => {
    await delay(300);
    return HttpResponse.json(getUsersBreakdown());
  }),

  http.get<{ id: string }>("/api/users/:id", async ({ params }) => {
    await delay(300);
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user)
      return HttpResponse.json(
        { message: "User not found", error: "Not Found", statusCode: 404 },
        { status: 404 },
      );
    return HttpResponse.json(user);
  }),

  http.post<never, Partial<User>>("/api/users", async ({ request }) => {
    await delay(500);
    const body = await request.json();
    const newUser: User = {
      id: generateUserId(),
      email: body.email ?? "",
      role: body.role ?? "dev",
      fullName: body.fullName ?? "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.patch<{ id: string }, Partial<User>>(
    "/api/users/:id",
    async ({ params, request }) => {
      await delay(500);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          { message: "User not found", error: "Not Found", statusCode: 404 },
          { status: 404 },
        );
      const body = await request.json();
      const {
        id: _id,
        createdAt: _createdAt,
        isActive: _isActive,
        ...safeBody
      } = body;
      Object.assign(user, safeBody, { updatedAt: new Date().toISOString() });
      return HttpResponse.json(user);
    },
  ),

  http.patch<{ id: string }>(
    "/api/users/:id/deactivate",
    async ({ params }) => {
      await delay(400);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          { message: "User not found", error: "Not Found", statusCode: 404 },
          { status: 404 },
        );
      Object.assign(user, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(user);
    },
  ),

  http.patch<{ id: string }>(
    "/api/users/:id/reactivate",
    async ({ params }) => {
      await delay(400);
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user)
        return HttpResponse.json(
          { message: "User not found", error: "Not Found", statusCode: 404 },
          { status: 404 },
        );
      Object.assign(user, {
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(user);
    },
  ),

  http.patch<
    { id: string },
    Omit<ResetPasswordFormValues, "confirmNewPassword">
  >("/api/users/:id/reset-password", async ({ params }) => {
    await delay(500);
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user)
      return HttpResponse.json(
        { message: "User not found", error: "Not Found", statusCode: 404 },
        { status: 404 },
      );
    // No data to mutate for mock
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete<{ id: string }>("/api/users/:id", async ({ params }) => {
    await delay(300);
    const index = mockUsers.findIndex((u) => u.id === params.id);
    if (index === -1)
      return HttpResponse.json(
        { message: "User not found", error: "Not Found", statusCode: 404 },
        { status: 404 },
      );
    mockUsers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
