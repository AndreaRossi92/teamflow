import { http, HttpResponse, delay } from "msw";
import { mockProjects } from "../data/project.data";
import type { Project } from "../../features/project/types/project";
import { mockUsers } from "../data/user.data";

export const projectHandlers = [
  http.get("/api/projects", async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockProjects,
      total: mockProjects.length,
      page: 1,
      limit: 20,
      hasNexPage: false,
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

  http.get<{ id: string }>(
    "/api/projects/:id/assignable-users",
    async ({ params }) => {
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

      return HttpResponse.json(
        mockUsers.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          isMember: project.members.map((u) => u.id).includes(user.id),
        })),
      );
    },
  ),

  http.patch<{ id: string }, { userIds: string[] }>(
    "/api/projects/:id/assign",
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
      return HttpResponse.json({
        ...project,
        members: mockUsers.filter((user) => body.userIds.includes(user.id)),
        updatedAt: new Date(),
      });
    },
  ),

  http.delete<{ id: string }>("/api/projects/:id", async ({ params }) => {
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
    return HttpResponse.json();
  }),
];
