import { http, HttpResponse, delay } from "msw";
import { mockProjects } from "../data/project.data";
import type { Project } from "../../types/project";

export const projectHandlers = [
  http.get("/api/projects", async () => {
    await delay(500);
    return HttpResponse.json({
      count: mockProjects.length,
      total: mockProjects.length,
      page: 1,
      pageCount: 1,
      data: mockProjects,
    });
  }),

  http.get<{ id: string }>("/api/projects/:id", async ({ params }) => {
    await delay(300);
    const project = mockProjects.find((u) => u.id === params.id);
    if (!project)
      return HttpResponse.json(
        {
          message: "Project not found",
          error: "Not Found",
          statusCode: 404,
        },
        { status: 404 },
      );
    return HttpResponse.json(project);
  }),

  http.post<never, Partial<Project>>("/api/projects", async ({ request }) => {
    await delay(500);
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      id: "mock-uuid-project-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }),

  http.patch<{ id: string }, Partial<Project>>(
    "/api/projects/:id",
    async ({ params, request }) => {
      await delay(500);
      const project = mockProjects.find((u) => u.id === params.id);
      if (!project)
        return HttpResponse.json(
          {
            message: "Project not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      const body = await request.json();
      return HttpResponse.json({ ...project, ...body, updatedAt: new Date() });
    },
  ),

  http.patch<{ id: string }>(
    "/api/projects/:id/deactivate",
    async ({ params }) => {
      await delay(400);
      const project = mockProjects.find((u) => u.id === params.id);
      if (!project)
        return HttpResponse.json(
          {
            message: "Project not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      return HttpResponse.json({ ...project, isActive: false });
    },
  ),

  http.patch<{ id: string }>(
    "/api/projects/:id/reactivate",
    async ({ params }) => {
      await delay(400);
      const project = mockProjects.find((u) => u.id === params.id);
      if (!project)
        return HttpResponse.json(
          {
            message: "Project not found",
            error: "Not Found",
            statusCode: 404,
          },
          { status: 404 },
        );
      return HttpResponse.json({ ...project, isActive: true });
    },
  ),
];
