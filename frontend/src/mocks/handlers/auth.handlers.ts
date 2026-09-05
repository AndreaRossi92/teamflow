import { http, HttpResponse, delay } from "msw";
import { mockUsers } from "../data/user.data";
import {
  clearCurrentUser,
  getCurrentUser,
  setCurrentUser,
} from "../data/auth.data";
import type { ChangePasswordFormValues } from "../../features/auth/types/changePasswordForm";
import { unauthorized } from "../data/http.errors";

const MOCK_PASSWORD = "password123";

export const authHandlers = [
  http.post<never, { email: string; password: string }>(
    "/api/auth/login",
    async ({ request }) => {
      await delay(800);
      const { email, password } = await request.json();

      const user = mockUsers.find((u) => u.email === email);

      if (!user || password !== MOCK_PASSWORD) {
        return unauthorized("Invalid credentials");
      }

      setCurrentUser(user);
      return HttpResponse.json({ user });
    },
  ),

  http.post("/api/auth/logout", async () => {
    await delay(300);
    clearCurrentUser();
    return HttpResponse.json({ success: true });
  }),

  http.post<never, Omit<ChangePasswordFormValues, "confirmNewPassword">>(
    "/api/auth/change-password",
    async ({ request }) => {
      await delay(500);

      const currentUser = getCurrentUser();
      if (!currentUser) return unauthorized();

      const { currentPassword } = await request.json();
      if (currentPassword !== MOCK_PASSWORD) {
        return unauthorized("Invalid credentials");
      }

      return HttpResponse.json({ user: currentUser });
    },
  ),
];
