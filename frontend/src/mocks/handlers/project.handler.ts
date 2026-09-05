import { http, HttpResponse, delay } from "msw";
import { generateProjectId, mockProjects } from "../data/project.data";
import type { Project } from "../../features/project/types/project";
import type { User } from "../../features/user/types/user";
import { mockUsers } from "../data/user.data";
import {
  getMembersWorkload,
  getProjectsWorkload,
} from "../data/dashboard.data";
import {
  type ErrorResponse,
  isErrorResponse,
  requireRole,
  requireUser,
} from "../handlers/guards";
import { badRequest, forbidden, notFound } from "../data/http.errors";

function isProjectMember(project: Project, userId: string): boolean {
  return project.members.some((m) => m.id === userId);
}

function findProjectWithAccess(
  id: string,
  currentUser: User,
): Project | ErrorResponse {
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return notFound("Project not found");

  if (
    currentUser.role !== "admin" &&
    !isProjectMember(project, currentUser.id)
  ) {
    return forbidden();
  }

  return project;
}

export const projectHandlers = [
  http.get("/api/projects", async ({ request }) => {
    await delay(500);
    const auth = requireUser();
    if (isErrorResponse(auth)) return auth;
    const currentUser = auth;

    const url = new URL(request.url);
    const name = url.searchParams.get("name") ?? undefined;
    const isActiveParam = url.searchParams.get("isActive");
    const isActive =
      isActiveParam === null ? undefined : isActiveParam === "true";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 20;

    let filtered =
      currentUser.role === "admin"
        ? mockProjects
        : mockProjects.filter((p) => isProjectMember(p, currentUser.id));

    if (name) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase()),
      );
    }
    if (isActive !== undefined) {
      filtered = filtered.filter((p) => p.isActive === isActive);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = [...filtered]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(start, start + limit);

    return HttpResponse.json({
      data,
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    });
  }),

  http.get("/api/projects/workload", async () => {
    await delay(500);
    const auth = requireUser();
    if (isErrorResponse(auth)) return auth;

    return HttpResponse.json(getProjectsWorkload(auth));
  }),

  http.get("/api/projects/members-workload", async () => {
    await delay(500);
    const auth = requireRole("admin", "manager");
    if (isErrorResponse(auth)) return auth;

    return HttpResponse.json(getMembersWorkload(auth));
  }),

  http.get<{ id: string }>("/api/projects/:id", async ({ params }) => {
    await delay(300);
    const auth = requireUser();
    if (isErrorResponse(auth)) return auth;

    const result = findProjectWithAccess(params.id, auth);
    if (isErrorResponse(result)) return result;

    return HttpResponse.json(result);
  }),

  http.post<never, Partial<Project>>("/api/projects", async ({ request }) => {
    await delay(500);
    const auth = requireRole("admin", "manager");
    if (isErrorResponse(auth)) return auth;
    const currentUser = auth;

    const body = await request.json();
    const newProject: Project = {
      id: generateProjectId(),
      name: body.name ?? "",
      description: body.description ?? "",
      createdBy: currentUser,
      isActive: true,
      members: [currentUser],
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
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const result = findProjectWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const project = result;

      const body = await request.json();
      const {
        id: _id,
        createdBy: _createdBy,
        createdAt: _createdAt,
        isActive: _isActive,
        members: _members,
        ...safeBody
      } = body;
      Object.assign(project, safeBody, {
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
    },
  ),

  http.patch<{ id: string }>(
    "/api/projects/:id/deactivate",
    async ({ params }) => {
      await delay(400);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const result = findProjectWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const project = result;

      if (!project.isActive) return badRequest("Project already not active");

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
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const result = findProjectWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const project = result;

      if (project.isActive) return badRequest("Project already active");

      Object.assign(project, {
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
    },
  ),

  http.get<{ id: string }>(
    "/api/projects/:id/assignable-users",
    async ({ params, request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const result = findProjectWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const project = result;

      const url = new URL(request.url);
      const fullName = url.searchParams.get("fullName") ?? undefined;
      const role = url.searchParams.get("role") ?? undefined;
      const memberIds = new Set(project.members.map((u) => u.id));

      const resultList = mockUsers
        .filter(
          (u) =>
            u.isActive &&
            (!fullName ||
              u.fullName.toLowerCase().includes(fullName.toLowerCase())) &&
            (!role || u.role === role),
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isMember: memberIds.has(user.id),
        }));

      return HttpResponse.json(resultList);
    },
  ),

  http.patch<{ id: string }, { userIds: string[] }>(
    "/api/projects/:id/assign",
    async ({ params, request }) => {
      await delay(500);
      const auth = requireRole("admin", "manager");
      if (isErrorResponse(auth)) return auth;

      const result = findProjectWithAccess(params.id, auth);
      if (isErrorResponse(result)) return result;
      const project = result;

      const body = await request.json();
      const users = mockUsers.filter((user) => body.userIds.includes(user.id));
      if (users.length !== body.userIds.length) {
        return notFound("User not found");
      }

      Object.assign(project, {
        members: users,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(project);
    },
  ),

  http.delete<{ id: string }>("/api/projects/:id", async ({ params }) => {
    await delay(300);
    const auth = requireRole("admin", "manager");
    if (isErrorResponse(auth)) return auth;

    const result = findProjectWithAccess(params.id, auth);
    if (isErrorResponse(result)) return result;
    const project = result;

    if (project.isActive) {
      return badRequest("Project must be not active");
    }

    const index = mockProjects.findIndex((p) => p.id === project.id);
    mockProjects.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
