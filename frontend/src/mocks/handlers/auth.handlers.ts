import { http, HttpResponse, delay } from "msw";
import { mockAdminUser } from "../data/auth.data";
import type { ChangePasswordFormValues } from "../../types/changePasswordForm";

export const authHandlers = [
  http.post<never, { email: string; password: string }>(
    "/api/auth/login",
    async ({ request }) => {
      await delay(800);
      const { email, password } = await request.json();
      if (email !== "admin@teamflow.com" || password !== "admin123")
        return HttpResponse.json(
          {
            message: "Invalid credentials",
            error: "Unauthorized",
            statusCode: 401,
          },
          { status: 401 },
        );
      return HttpResponse.json({ user: mockAdminUser });
    },
  ),

  http.post("/api/auth/logout", async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  http.post<never, Omit<ChangePasswordFormValues, "confirmNewPassword">>(
    "/api/auth/change-password",
    async ({ request }) => {
      await delay(500);
      const { currentPassword } = await request.json();
      if (currentPassword !== "admin123")
        return HttpResponse.json(
          {
            message: "Invalid credentials",
            error: "Unauthorized",
            statusCode: 401,
          },
          { status: 401 },
        );
      return HttpResponse.json({ user: mockAdminUser });
    },
  ),
];
