import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ProjectsList from "./ProjectsList";
import type { Project } from "../types/project";

// ── Fixtures ───────────────────────────────────────────────────────────────────
const createdByUser = {
  id: "u1",
  email: "jane@example.com",
  fullName: "Jane Doe",
  role: "admin" as const,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

const activeProject: Project = {
  id: "p1",
  name: "Alpha Project",
  description: "First project",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
  createdBy: createdByUser,
  members: [],
};

const inactiveProject: Project = {
  id: "p2",
  name: "Beta Project",
  description: "Second project",
  isActive: false,
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-07-01T00:00:00.000Z",
  createdBy: createdByUser,
  members: [],
};

// ── Render helper ──────────────────────────────────────────────────────────────
function renderProjectsList(
  projects: Project[],
  onClick?: (project: Project) => void,
  actions?: (project: Project) => React.ReactNode,
) {
  return render(
    <ProjectsList projects={projects} onClick={onClick} actions={actions} />,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("ProjectsList", () => {
  describe("rendering", () => {
    it("renders each project's name", () => {
      renderProjectsList([activeProject, inactiveProject]);

      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
      expect(screen.getByText("Beta Project")).toBeInTheDocument();
    });

    it("renders nothing when the list is empty", () => {
      const { container } = renderProjectsList([]);
      expect(container.querySelector("li")).not.toBeInTheDocument();
    });
  });

  describe("onClick", () => {
    it("calls onClick with the correct project when a row is clicked", async () => {
      const handleClick = vi.fn();
      renderProjectsList([activeProject], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Alpha Project"));

      expect(handleClick).toHaveBeenCalledWith(activeProject);
    });

    it("calls onClick with the correct project when multiple rows are present", async () => {
      const handleClick = vi.fn();
      renderProjectsList([activeProject, inactiveProject], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Beta Project"));

      expect(handleClick).toHaveBeenCalledWith(inactiveProject);
    });

    it("does not throw when onClick is not provided and a row is clicked", async () => {
      renderProjectsList([activeProject]);
      const user = userEvent.setup();

      await expect(
        user.click(screen.getByText("Alpha Project")),
      ).resolves.not.toThrow();
    });
  });

  describe("actions slot", () => {
    it("renders the actions for each project when provided", () => {
      renderProjectsList(
        [activeProject, inactiveProject],
        undefined,
        (project) => <button>{`action-${project.id}`}</button>,
      );

      expect(screen.getByText("action-p1")).toBeInTheDocument();
      expect(screen.getByText("action-p2")).toBeInTheDocument();
    });

    it("passes the correct project object to the actions callback", () => {
      const actions = vi.fn(() => null);
      renderProjectsList([activeProject], undefined, actions);

      expect(actions).toHaveBeenCalledWith(activeProject);
    });
  });
});
