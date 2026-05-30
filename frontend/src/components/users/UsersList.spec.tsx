import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import UsersList from "./UsersList";
import type { User } from "../../types/user";

// ── Fixtures ───────────────────────────────────────────────────────────────────
const activeUser: User = {
  id: "1",
  email: "alice@example.com",
  fullName: "Alice Smith",
  role: "dev",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

const inactiveUser: User = {
  id: "2",
  email: "bob@example.com",
  fullName: "Bob Jones",
  role: "admin",
  isActive: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

// ── Render helper ──────────────────────────────────────────────────────────────
function renderUsersList(
  users: User[],
  onClick?: (user: User) => void,
  actions?: (user: User) => React.ReactNode,
) {
  return render(
    <UsersList users={users} onClick={onClick} actions={actions} />,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("UsersList", () => {
  describe("rendering", () => {
    it("renders each user's full name", () => {
      renderUsersList([activeUser, inactiveUser]);

      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });

    it("renders each user's email", () => {
      renderUsersList([activeUser, inactiveUser]);

      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    it("renders each user's role as a chip", () => {
      renderUsersList([activeUser, inactiveUser]);

      expect(screen.getByText("dev")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    it("renders nothing when the list is empty", () => {
      const { container } = renderUsersList([]);
      expect(container.querySelector("li")).not.toBeInTheDocument();
    });
  });

  describe("onClick", () => {
    it("calls onClick with the correct user when a row is clicked", async () => {
      const handleClick = vi.fn();
      renderUsersList([activeUser], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Alice Smith"));

      expect(handleClick).toHaveBeenCalledWith(activeUser);
    });

    it("calls onClick with the correct user when multiple rows are present", async () => {
      const handleClick = vi.fn();
      renderUsersList([activeUser, inactiveUser], handleClick);
      const user = userEvent.setup();

      await user.click(screen.getByText("Bob Jones"));

      expect(handleClick).toHaveBeenCalledWith(inactiveUser);
    });

    it("does not throw when onClick is not provided and a row is clicked", async () => {
      renderUsersList([activeUser]);
      const user = userEvent.setup();

      await expect(
        user.click(screen.getByText("Alice Smith")),
      ).resolves.not.toThrow();
    });
  });

  describe("actions slot", () => {
    it("renders the actions for each user when provided", () => {
      renderUsersList([activeUser, inactiveUser], undefined, (user) => (
        <button>{`action-${user.id}`}</button>
      ));

      expect(screen.getByText("action-1")).toBeInTheDocument();
      expect(screen.getByText("action-2")).toBeInTheDocument();
    });

    it("passes the correct user object to the actions callback", () => {
      const actions = vi.fn(() => null);
      renderUsersList([activeUser], undefined, actions);

      expect(actions).toHaveBeenCalledWith(activeUser);
    });
  });
});
