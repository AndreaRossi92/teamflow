import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UserDetail from "./UserDetail";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("../../formatters/date", () => ({
  formatDateTime: (date: string) => date,
}));

// ── Fixtures ───────────────────────────────────────────────────────────────────
const activeUser = {
  id: "1",
  email: "john@example.com",
  fullName: "John Doe",
  role: "dev" as const,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

const inactiveUser = { ...activeUser, isActive: false };

// ── Tests ──────────────────────────────────────────────────────────────────────
describe("UserDetail", () => {
  describe("rendering", () => {
    it("shows the user's full name", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("shows the user's email", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("shows the user's role as a chip", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText("dev")).toBeInTheDocument();
    });

    it("shows the createdAt date", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText(activeUser.createdAt)).toBeInTheDocument();
    });

    it("shows the updatedAt date", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText(activeUser.updatedAt)).toBeInTheDocument();
    });

    it("shows the field labels via translation keys", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("createdAt")).toBeInTheDocument();
      expect(screen.getByText("updatedAt")).toBeInTheDocument();
    });
  });

  describe("active status", () => {
    it("renders without errors for an active user", () => {
      render(<UserDetail user={activeUser} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("renders without errors for an inactive user", () => {
      render(<UserDetail user={inactiveUser} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});
