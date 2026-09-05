import { HttpResponse, type DefaultBodyType } from "msw";
import { getCurrentUser } from "../data/auth.data";
import type { User } from "../../features/user/types/user";
import { forbidden, unauthorized } from "../data/http.errors";

export type ErrorResponse = HttpResponse<DefaultBodyType>;

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return value instanceof Response;
}

export function requireUser(): User | ErrorResponse {
  const user = getCurrentUser();
  if (!user) return unauthorized();
  return user;
}

export function requireRole(...roles: User["role"][]): User | ErrorResponse {
  const result = requireUser();
  if (isErrorResponse(result)) return result;
  if (!roles.includes(result.role)) return forbidden();
  return result;
}
