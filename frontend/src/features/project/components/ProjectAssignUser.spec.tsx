import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ProjectAssignUsers from "./ProjectAssignUser";
import type { AssignableUser } from "../types/project";

// ── Fixtures ───────────────────────────────────────────────────────────────────
const memberUser: AssignableUser = {
  id: "1",
  email: "alice@example.com",
  fullName: "Alice Smith",
  role: "dev",
  isMember: true,
};

const nonMemberUser: AssignableUser = {
  id: "2",
  email: "bob@example.com",
  fullName: "Bob Jones",
  role: "admin",
  isMember: false,
};

// ── Render helper ──────────────────────────────────────────────────────────────
function renderProjectAssignUsers(
  assignableUsers: AssignableUser[],
  onClick?: (user: AssignableUser) => void,
  actions?: (user: AssignableUser) => React.ReactNode,
) {
  return render(
    <ProjectAssignUsers
      assignableUsers={assignableUsers}
      onClick={onClick}
      actions={actions}
    />,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("ProjectAssignUsers", () => {
  describe("rendering", () => {
    it("renders each user's full name", () => {
      renderProjectAssignUsers([memberUser, nonMemberUser]);

      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    it("renders each user's email", () => {
      renderProjectAssignUsers([memberUser, nonMemberUser]);

      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    it("renders each user's role as a chip", () => {
      renderProjectAssignUsers([memberUser, nonMemberUser]);

      expect(screen.getByText("dev")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    it("renders nothing when the list is empty", () => {
      const { container } = renderProjectAssignUsers([]);
      expect(container.querySelector("li")).not.toBeInTheDocument();
    });
  });

  describe("checkbox", () => {
    it("renders a checked checkbox for a member user", () => {
      renderProjectAssignUsers([memberUser]);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders an unchecked checkbox for a non-member user", () => {
      renderProjectAssignUsers([nonMemberUser]);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("onClick", () => {
    it("calls onClick with the correct user when a row is clicked", async () => {
      const handleClick = vi.fn();
      renderProjectAssignUsers([memberUser], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Alice Smith"));

      expect(handleClick).toHaveBeenCalledWith(memberUser);
    });

    it("calls onClick with the correct user when multiple rows are present", async () => {
      const handleClick = vi.fn();
      renderProjectAssignUsers([memberUser, nonMemberUser], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Bob Jones"));

      expect(handleClick).toHaveBeenCalledWith(nonMemberUser);
    });

    it("does not throw when onClick is not provided and a row is clicked", async () => {
      renderProjectAssignUsers([memberUser]);
      const user = userEvent.setup();

      await expect(
        user.click(screen.getByText("Alice Smith")),
      ).resolves.not.toThrow();
    });
  });

  describe("actions slot", () => {
    it("renders the actions for each user when provided", () => {
      renderProjectAssignUsers(
        [memberUser, nonMemberUser],
        undefined,
        (user) => <button>{`action-${user.id}`}</button>,
      );

      expect(screen.getByText("action-1")).toBeInTheDocument();
      expect(screen.getByText("action-2")).toBeInTheDocument();
    });

    it("passes the correct user object to the actions callback", () => {
      const actions = vi.fn(() => null);
      renderProjectAssignUsers([memberUser], undefined, actions);

      expect(actions).toHaveBeenCalledWith(memberUser);
    });
  });
});
