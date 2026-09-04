import { http, HttpResponse, delay } from "msw";
import { generateProjectId, mockProjects } from "../data/project.data";
import type { Project } from "../../features/project/types/project";
import { mockAdminUser, mockUsers } from "../data/user.data";
import {
  getMembersWorkload,
  getProjectsWorkload,
} from "../data/dashboard.data";

export const projectHandlers = [
  http.get("/api/projects", async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockProjects,
      total: mockProjects.length,
      page: 1,
      limit: mockProjects.length,
      hasNextPage: false,
    });
  }),

  http.get("/api/projects/workload", async () => {
    await delay(500);
    return HttpResponse.json(getProjectsWorkload());
  }),

  http.get("/api/projects/members-workload", async () => {
    await delay(500);
    return HttpResponse.json(getMembersWorkload());
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
    const newProject: Project = {
      id: generateProjectId(),
      name: body.name ?? "",
      description: body.description ?? "",
      createdBy: mockAdminUser,
      isActive: true,
      members: [mockAdminUser],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return HttpResponse.json(newProject, { status: 201 });
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
      const {
        id: _id,
        createdBy: _createdBy,
        createdAt: _createdAt,
        isActive: _isActive,
        members: _members,
        ...safeBody
      } = body;
      Object.assign(project, safeBody, { updatedAt: new Date().toISOString() });
      return HttpResponse.json(project);
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
      Object.assign(project, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
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
      Object.assign(project, {
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
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
      Object.assign(project, {
        members: mockUsers.filter((user) => body.userIds.includes(user.id)),
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
    },
  ),

  http.delete<{ id: string }>("/api/projects/:id", async ({ params }) => {
    await delay(300);
    const index = mockProjects.findIndex((u) => u.id === params.id);
    if (index === -1)
      return HttpResponse.json(
        {
          message: "Project not found",
          error: "Not Found",
          statusCode: 404,
        },
        { status: 404 },
      );
    mockProjects.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
