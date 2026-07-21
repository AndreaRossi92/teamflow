import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProjectDetail from "./ProjectDetail";

vi.mock("../../../formatters/date", () => ({
  formatDateTime: (date: string) => date,
}));

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

const member = {
  id: "u2",
  email: "bob@example.com",
  fullName: "Bob Smith",
  role: "dev" as const,
  isActive: true,
  createdAt: "2024-02-01T00:00:00.000Z",
  updatedAt: "2024-07-01T00:00:00.000Z",
};

const projectWithEverything = {
  id: "p1",
  name: "Awesome Project",
  description: "A very useful project",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
  createdBy: createdByUser,
  members: [member],
};

const projectNoDescription = {
  ...projectWithEverything,
  description: undefined,
};

const projectNoMembers = {
  ...projectWithEverything,
  members: [],
};

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("ProjectDetail", () => {
  describe("rendering", () => {
    it("shows the project name", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.getByText("Awesome Project")).toBeInTheDocument();
    });

    it("shows the project description when present", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.getByText("A very useful project")).toBeInTheDocument();
    });

    it("shows the createdBy full name", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("shows the createdAt date", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(
        screen.getByText(projectWithEverything.createdAt),
      ).toBeInTheDocument();
    });

    it("shows the updatedAt date", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(
        screen.getByText(projectWithEverything.updatedAt),
      ).toBeInTheDocument();
    });

    it("shows the field labels via translation keys", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.getByText("description")).toBeInTheDocument();
      expect(screen.getByText("createdBy")).toBeInTheDocument();
      expect(screen.getByText("createdAt")).toBeInTheDocument();
      expect(screen.getByText("updatedAt")).toBeInTheDocument();
      expect(screen.getByText("members")).toBeInTheDocument();
    });

    it("shows the members list when members are present", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.getByText("Bob Smith")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("shows a fallback alert when description is absent", () => {
      render(<ProjectDetail project={projectNoDescription} />);
      expect(screen.getByText("noDescription")).toBeInTheDocument();
    });

    it("does not show the fallback alert when description is present", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.queryByText("noDescription")).not.toBeInTheDocument();
    });
  });

  describe("members", () => {
    it("shows a fallback alert when no members are present", () => {
      render(<ProjectDetail project={projectNoMembers} />);
      expect(screen.getByText("noMembers")).toBeInTheDocument();
    });

    it("does not show the fallback alert when members are present", () => {
      render(<ProjectDetail project={projectWithEverything} />);
      expect(screen.queryByText("noMembers")).not.toBeInTheDocument();
    });
  });
});
