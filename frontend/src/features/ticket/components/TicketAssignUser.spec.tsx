import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TicketAssignUsers from "./TicketAssignUser";
import type { AssignableUser } from "../types/ticket";

// ── Child mocks ─────────────────────────────────────────────────────────────
vi.mock("../ActiveDot", () => ({
  default: () => <span data-testid="active-dot" />,
}));

// ── Fixtures ────────────────────────────────────────────────────────────────
function buildUser(overrides: Partial<AssignableUser> = {}): AssignableUser {
  return {
    id: "user-1",
    fullName: "Alice Manager",
    email: "alice@teamflow.com",
    role: "manager",
    isMember: false,
    ...overrides,
  } as AssignableUser;
}

const alice = buildUser({ id: "user-1", fullName: "Alice", isMember: true });
const bob = buildUser({
  id: "user-2",
  fullName: "Bob",
  role: "dev",
  isMember: false,
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("TicketAssignUsers", () => {
  it("renders one row per assignable user", () => {
    render(<TicketAssignUsers assignableUsers={[alice, bob]} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders each user's email as secondary text", () => {
    render(<TicketAssignUsers assignableUsers={[alice]} />);

    expect(screen.getByText("alice@teamflow.com")).toBeInTheDocument();
  });

  it("checks the checkbox for members and unchecks it for non-members", () => {
    render(<TicketAssignUsers assignableUsers={[alice, bob]} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("calls onClick with the clicked user", async () => {
    const onClick = vi.fn();
    render(
      <TicketAssignUsers assignableUsers={[alice, bob]} onClick={onClick} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByText("Bob"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(bob);
  });

  it("does not throw when a row is clicked and onClick is not provided", async () => {
    render(<TicketAssignUsers assignableUsers={[alice]} />);
    const user = userEvent.setup();

    await expect(user.click(screen.getByText("Alice"))).resolves.not.toThrow();
  });

  it("renders the actions render-prop content for each user", () => {
    render(
      <TicketAssignUsers
        assignableUsers={[alice]}
        actions={(user) => <button>Remove {user.fullName}</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: /remove alice/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when the assignable users list is empty", () => {
    render(<TicketAssignUsers assignableUsers={[]} />);

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
