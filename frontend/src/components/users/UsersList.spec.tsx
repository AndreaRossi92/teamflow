import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import UsersList from "./UsersList";
import type { User } from "../../types/user";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

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
  actions?: (user: User) => React.ReactNode,
) {
  return render(
    <MemoryRouter>
      <UsersList users={users} actions={actions} />
    </MemoryRouter>,
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

  describe("navigation", () => {
    it("navigates to the user detail page when a row is clicked", async () => {
      renderUsersList([activeUser]);
      const user = userEvent.setup();

      await user.click(screen.getByText("Alice Smith"));

      expect(mockNavigate).toHaveBeenCalledWith(`/user/${activeUser.id}`);
    });

    it("navigates to the correct user when multiple rows are present", async () => {
      renderUsersList([activeUser, inactiveUser]);
      const user = userEvent.setup();

      await user.click(screen.getByText("Bob Jones"));

      expect(mockNavigate).toHaveBeenCalledWith(`/user/${inactiveUser.id}`);
    });
  });

  describe("actions slot", () => {
    it("renders the actions for each user when provided", () => {
      renderUsersList([activeUser, inactiveUser], (user) => (
        <button>{`action-${user.id}`}</button>
      ));

      expect(screen.getByText("action-1")).toBeInTheDocument();
      expect(screen.getByText("action-2")).toBeInTheDocument();
    });

    it("passes the correct user object to the actions callback", () => {
      const actions = vi.fn(() => null);
      renderUsersList([activeUser], actions);

      expect(actions).toHaveBeenCalledWith(activeUser);
    });
  });
});
