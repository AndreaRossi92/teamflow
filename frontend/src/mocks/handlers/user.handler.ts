import { http, HttpResponse, delay } from "msw";
import { mockUsers, generateUserId } from "../data/user.data";
import type { User } from "../../features/user/types/user";
import { getMockUserWorkload, getUsersBreakdown } from "../data/dashboard.data";
import type { ResetPasswordFormValues } from "../../features/auth/types/resetPasswordForm";
import { isErrorResponse, requireRole } from "./guards";
import { badRequest, notFound } from "../data/http.errors";

export const userHandlers = [
  http.get("/api/users", async ({ request }) => {
    await delay(500);
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

    const url = new URL(request.url);
    const fullName = url.searchParams.get("fullName") ?? undefined;
    const role = url.searchParams.get("role") ?? undefined;
    const isActiveParam = url.searchParams.get("isActive");
    const isActive =
      isActiveParam === null ? undefined : isActiveParam === "true";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    let filtered = mockUsers;
    if (fullName) {
      filtered = filtered.filter((u) =>
        u.fullName.toLowerCase().includes(fullName.toLowerCase()),
      );
    }
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }
    if (isActive !== undefined) {
      filtered = filtered.filter((u) => u.isActive === isActive);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = [...filtered]
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .slice(start, start + limit);

    return HttpResponse.json({
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    });
  }),

  http.get("/api/users/me/workload", async () => {
    await delay(400);
    const auth = requireRole("admin", "manager", "dev");
    if (isErrorResponse(auth)) return auth;

    return HttpResponse.json(getMockUserWorkload(auth.id));
  }),

  http.get("/api/users/breakdown", async () => {
    await delay(300);
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

    return HttpResponse.json(getUsersBreakdown());
  }),

  http.get<{ id: string }>("/api/users/:id", async ({ params }) => {
    await delay(300);
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) return notFound("User not found");
    return HttpResponse.json(user);
  }),

  http.post<never, Partial<User>>("/api/users", async ({ request }) => {
    await delay(500);
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

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
      const auth = requireRole("admin");
      if (isErrorResponse(auth)) return auth;

      const user = mockUsers.find((u) => u.id === params.id);
      if (!user) return notFound("User not found");

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
      const auth = requireRole("admin");
      if (isErrorResponse(auth)) return auth;

      const user = mockUsers.find((u) => u.id === params.id);
      if (!user) return notFound("User not found");
      if (!user.isActive) return badRequest("User already not active");

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
      const auth = requireRole("admin");
      if (isErrorResponse(auth)) return auth;

      const user = mockUsers.find((u) => u.id === params.id);
      if (!user) return notFound("User not found");
      if (user.isActive) return badRequest("User already active");

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
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) return notFound("User not found");
    // No data to mutate for mock
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete<{ id: string }>("/api/users/:id", async ({ params }) => {
    await delay(300);
    const auth = requireRole("admin");
    if (isErrorResponse(auth)) return auth;

    const index = mockUsers.findIndex((u) => u.id === params.id);
    if (index === -1) return notFound("User not found");
    if (mockUsers[index].isActive) {
      return badRequest("User must be not active");
    }
    mockUsers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
