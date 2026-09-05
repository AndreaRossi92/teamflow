import { HttpResponse } from "msw";

export function unauthorized(message = "Unauthorized") {
  return HttpResponse.json(
    { message, error: "Unauthorized", statusCode: 401 },
    { status: 401 },
  );
}

export function forbidden(message = "Forbidden resource") {
  return HttpResponse.json(
    { message, error: "Forbidden", statusCode: 403 },
    { status: 403 },
  );
}

export function notFound(message: string) {
  return HttpResponse.json(
    { message, error: "Not Found", statusCode: 404 },
    { status: 404 },
  );
}

export function badRequest(message: string) {
  return HttpResponse.json(
    { message, error: "Bad Request", statusCode: 400 },
    { status: 400 },
  );
}
