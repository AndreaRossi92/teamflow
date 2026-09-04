import { http, HttpResponse, delay } from "msw";
import { mockAdminUser, mockUsers } from "../data/user.data";
import type { ChangePasswordFormValues } from "../../features/auth/types/changePasswordForm";

const MOCK_PASSWORD = "password123";

export const authHandlers = [
  http.post<never, { email: string; password: string }>(
    "/api/auth/login",
    async ({ request }) => {
      await delay(800);
      const { email, password } = await request.json();

      const user = mockUsers.find((u) => u.email === email);

      if (!user || password !== MOCK_PASSWORD)
        return HttpResponse.json(
          {
            message: "Invalid credentials",
            error: "Unauthorized",
            statusCode: 401,
          },
          { status: 401 },
        );

      return HttpResponse.json({ user });
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
      if (currentPassword !== MOCK_PASSWORD)
        return HttpResponse.json(
          {
            message: "Invalid credentials",
            error: "Unauthorized",
            statusCode: 401,
          },
          { status: 401 },
        );
      // Note: logged user not known. Always return mockAdminUser
      return HttpResponse.json({ user: mockAdminUser });
    },
  ),
];
