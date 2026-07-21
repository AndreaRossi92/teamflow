import type { Project } from "../../features/project/types/project";
import { mockDevUser, mockManagerUser } from "./user.data";

export const mockProject1: Project = {
  id: "mock-uuid-project-1",
  name: "Project 1",
  description: "Project 1 description",
  isActive: true,
  createdBy: mockManagerUser,
  members: [mockManagerUser, mockDevUser],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockProject2: Project = {
  id: "mock-uuid-project-2",
  name: "Project 2",
  description: "Project 2 description",
  isActive: true,
  createdBy: mockManagerUser,
  members: [mockManagerUser, mockDevUser],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockProjects: Project[] = [mockProject1, mockProject2];
