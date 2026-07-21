import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TicketDetail from "./TicketDetail";
import type { Ticket } from "../../types/ticket";

// ── Child / util mocks ───────────────────────────────────────────────────────
// Badges, UsersList and the date formatter are stubbed so this suite only
// exercises TicketDetail's own layout/branching logic.
vi.mock("./TicketStatusBadge", () => ({
  TicketStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock("./TicketPriorityBadge", () => ({
  TicketPriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
}));

vi.mock("../../formatters/date", () => ({
  formatDateTime: (date: string) => `formatted:${date}`,
}));

vi.mock("../users/UsersList", () => ({
  default: ({ users }: { users: { fullName: string }[] }) => (
    <ul data-testid="users-list">
      {users.map((u) => (
        <li key={u.fullName}>{u.fullName}</li>
      ))}
    </ul>
  ),
}));

// ── Fixtures ────────────────────────────────────────────────────────────────
function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "ticket-1",
    title: "Fix login bug",
    description: "Login fails on Safari",
    status: "open",
    priority: "high",
    project: { name: "TeamFlow v2" } as Ticket["project"],
    createdBy: { fullName: "Admin User" } as Ticket["createdBy"],
    assignees: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-02-02T00:00:00.000Z",
    ...overrides,
  } as Ticket;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("TicketDetail", () => {
  it("renders the ticket title", () => {
    render(<TicketDetail ticket={buildTicket()} />);

    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
  });

  it("renders the status and priority badges", () => {
    render(<TicketDetail ticket={buildTicket()} />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("open");
    expect(screen.getByTestId("priority-badge")).toHaveTextContent("high");
  });

  it("renders the description when present", () => {
    render(
      <TicketDetail ticket={buildTicket({ description: "Some details" })} />,
    );

    expect(screen.getByText("Some details")).toBeInTheDocument();
  });

  it("shows the noDescription alert when description is missing", () => {
    render(<TicketDetail ticket={buildTicket({ description: "" })} />);

    expect(screen.getByText("noDescription")).toBeInTheDocument();
  });

  it("renders the project name", () => {
    render(
      <TicketDetail
        ticket={buildTicket({
          project: { name: "Design System" } as Ticket["project"],
        })}
      />,
    );

    expect(screen.getByText("Design System")).toBeInTheDocument();
  });

  it("renders the creator's full name", () => {
    render(
      <TicketDetail
        ticket={buildTicket({
          createdBy: { fullName: "Jane Doe" } as Ticket["createdBy"],
        })}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders formatted createdAt and updatedAt dates", () => {
    render(
      <TicketDetail
        ticket={buildTicket({
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-02-02T00:00:00.000Z",
        })}
      />,
    );

    expect(
      screen.getByText("formatted:2024-01-01T00:00:00.000Z"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("formatted:2024-02-02T00:00:00.000Z"),
    ).toBeInTheDocument();
  });

  it("renders the assignees list when there are assignees", () => {
    render(
      <TicketDetail
        ticket={buildTicket({
          assignees: [
            { fullName: "Alice" },
            { fullName: "Bob" },
          ] as Ticket["assignees"],
        })}
      />,
    );

    const list = screen.getByTestId("users-list");
    expect(list).toHaveTextContent("Alice");
    expect(list).toHaveTextContent("Bob");
  });

  it("shows the noMembers alert when there are no assignees", () => {
    render(<TicketDetail ticket={buildTicket({ assignees: [] })} />);

    expect(screen.getByText("noMembers")).toBeInTheDocument();
    expect(screen.queryByTestId("users-list")).not.toBeInTheDocument();
  });
});
