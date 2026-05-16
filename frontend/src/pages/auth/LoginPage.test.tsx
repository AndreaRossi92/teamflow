import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./LoginPage";
import { act } from "react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

const mockSetUser = vi.fn();
vi.mock("../providers/useAuth", () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

const server = setupServer();
beforeEach(() => {
  vi.clearAllMocks();
});
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const getEmailInput = () =>
  screen.getByRole("textbox", { name: /login\.email/i });
const getPasswordInput = () => screen.getByLabelText(/login\.password/i);
const getSubmitButton = () =>
  screen.getByRole("button", { name: /login\.submit/i });

describe("LoginPage", () => {
  describe("initial rendering", () => {
    it("shows title, fields and button", () => {
      renderLoginPage();

      expect(screen.getByText("login.title")).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });

    it("button disabled if empty form", () => {
      renderLoginPage();
      expect(getSubmitButton()).toBeDisabled();
    });
  });

  describe("validation", () => {
    it("button remains disabled with invalid email", async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "non-una-email");
      await user.type(getPasswordInput(), "password123");

      expect(getSubmitButton()).toBeDisabled();
    });

    it("button remains disabled with password too short", async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.type(getPasswordInput(), "123");

      expect(getSubmitButton()).toBeDisabled();
    });

    it("button enables with valid credentials", async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.tab();
      await user.type(getPasswordInput(), "password123");
      await user.tab();

      await waitFor(() => {
        expect(getSubmitButton()).toBeEnabled();
      });
    });
  });

  describe("submit — success", () => {
    it("call setUser and navigate to '/' after successful login", async () => {
      const fakeUser = { id: 1, email: "test@example.com", role: "admin" };

      server.use(
        http.post("/api/auth/login", () =>
          HttpResponse.json({ user: fakeUser }),
        ),
      );

      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.type(getPasswordInput(), "password123");
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      });
    });
  });

  describe("submit — error", () => {
    it("shows error message if login fails", async () => {
      server.use(
        http.post("/api/auth/login", () =>
          HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
        ),
      );

      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.type(getPasswordInput(), "wrongpassword");
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText("login.error")).toBeInTheDocument();
      });
    });

    it("does not navigate if login fails", async () => {
      server.use(
        http.post("/api/auth/login", () =>
          HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
        ),
      );

      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.type(getPasswordInput(), "wrongpassword");
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe("sends pressing Enter", () => {
    it("submits pressing Enter on password field (if form is valid)", async () => {
      const fakeUser = { id: 1, email: "test@example.com" };

      server.use(
        http.post("/api/auth/login", () =>
          HttpResponse.json({ user: fakeUser }),
        ),
      );

      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.type(getPasswordInput(), "password123");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
      });
    });

    it("submits pressing Enter on email field (if form is valid)", async () => {
      const fakeUser = { id: 1, email: "test@example.com" };

      server.use(
        http.post("/api/auth/login", () =>
          HttpResponse.json({ user: fakeUser }),
        ),
      );

      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getPasswordInput(), "password123");
      await user.type(getEmailInput(), "test@example.com");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(fakeUser);
      });
    });
  });

  describe("does not send pressing Enter", () => {
    it("does not submit pressing Enter if form is not valid", async () => {
      renderLoginPage();
      const user = userEvent.setup();

      await user.type(getEmailInput(), "test@example.com");
      await user.keyboard("{Enter}");

      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe("demo mode", () => {
    it("show demo banner if VITE_DEMO_MODE is true", async () => {
      vi.stubEnv("VITE_DEMO_MODE", "true");

      // force re-import with new env variable
      vi.resetModules();
      const { default: LoginPage } = await import("./LoginPage");

      await act(async () => {
        render(
          <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter>
              <LoginPage />
            </MemoryRouter>
          </QueryClientProvider>,
        );
      });

      expect(screen.getByText("login.demoCredentials")).toBeInTheDocument();

      vi.unstubAllEnvs();
      vi.resetModules();
    });
  });
});
