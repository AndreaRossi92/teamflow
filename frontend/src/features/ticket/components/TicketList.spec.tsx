import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TicketsList from "./TicketsList";
import type { Ticket } from "../types/ticket";

// ── Child mocks ─────────────────────────────────────────────────────────────
// TicketStatusBadge / TicketPriorityBadge internals aren't known here, so we
// stub them out to keep this suite focused on TicketsList's own behaviour.
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

// ── Fixtures ────────────────────────────────────────────────────────────────
function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "ticket-1",
    title: "Fix login bug",
    description: "Login fails on Safari",
    status: "open",
    priority: "high",
    project: { name: "TeamFlow v2" } as Ticket["project"],
    createdBy: { fullName: "Admin" } as Ticket["createdBy"],
    assignees: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  } as Ticket;
}

const ticket1 = buildTicket({ id: "ticket-1", title: "Fix login bug" });
const ticket2 = buildTicket({
  id: "ticket-2",
  title: "Add dark mode",
  project: { name: "Design System" } as Ticket["project"],
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("TicketsList", () => {
  it("renders one row per ticket", () => {
    render(<TicketsList tickets={[ticket1, ticket2]} />);

    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
    expect(screen.getByText("Add dark mode")).toBeInTheDocument();
  });

  it("renders the project name as secondary text for each ticket", () => {
    render(<TicketsList tickets={[ticket1, ticket2]} />);

    expect(screen.getByText("TeamFlow v2")).toBeInTheDocument();
    expect(screen.getByText("Design System")).toBeInTheDocument();
  });

  it("renders the status and priority badges for each ticket", () => {
    render(<TicketsList tickets={[ticket1]} />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("open");
    expect(screen.getByTestId("priority-badge")).toHaveTextContent("high");
  });

  it("renders nothing when the ticket list is empty", () => {
    render(<TicketsList tickets={[]} />);

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("calls onClick with the clicked ticket", async () => {
    const onClick = vi.fn();
    render(<TicketsList tickets={[ticket1, ticket2]} onClick={onClick} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Add dark mode"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(ticket2);
  });

  it("does not throw when a row is clicked and onClick is not provided", async () => {
    render(<TicketsList tickets={[ticket1]} />);
    const user = userEvent.setup();

    await expect(
      user.click(screen.getByText("Fix login bug")),
    ).resolves.not.toThrow();
  });

  it("renders the actions render-prop content for each ticket", () => {
    render(
      <TicketsList
        tickets={[ticket1]}
        actions={(ticket) => <button>Edit {ticket.title}</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: /edit fix login bug/i }),
    ).toBeInTheDocument();
  });
});
