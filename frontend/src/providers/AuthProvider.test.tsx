import { render, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { AxiosError } from "axios";
import { AuthProvider } from "./AuthProvider";
import { api } from "../api/axios.instance";
import { refreshToken, logout as logoutApi } from "../api/auth";

vi.mock("../api/auth", () => ({
  refreshToken: vi.fn(),
  logout: vi.fn(),
}));

const mockRefreshToken = refreshToken as Mock;
const mockLogoutApi = logoutApi as Mock;

function make401Error(url = "/api/some-endpoint"): AxiosError {
  const error = new AxiosError("Unauthorized");
  error.response = {
    status: 401,
    data: {},
    headers: {},
    config: {},
    statusText: "Unauthorized",
  } as never;
  error.config = { url } as never;
  return error;
}

async function mountProvider() {
  const utils = render(
    <AuthProvider>
      <div data-testid="child" />
    </AuthProvider>,
  );
  await waitFor(() => expect(utils.getByTestId("child")).toBeInTheDocument());
  return utils;
}

function getInterceptorErrorHandler() {
  const handlers = api.interceptors.response.handlers as Array<{
    fulfilled: unknown;
    rejected: (e: unknown) => unknown;
  }>;
  const last = handlers.at(-1);
  if (!last) throw new Error("Nessun interceptor registrato");
  return last.rejected;
}

describe("AuthProvider — interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshToken.mockResolvedValue({
      id: "1",
      email: "u@test.com",
      role: "user",
      fullName: "User"
    });
  });

  it("should not intercept non-401 errors", async () => {
    await mountProvider();
    const handler = getInterceptorErrorHandler();
    const error = new AxiosError("Server error");
    error.response = { status: 500 } as never;
    error.config = { url: "/api/other" } as never;

    await act(async () => {
      await expect(handler(error)).rejects.toThrow("Server error");
    });

    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("should not intercept 401 on /auth/refresh (avoid infinite loop)", async () => {
    await mountProvider();
    const handler = getInterceptorErrorHandler();
    const error = make401Error("/api/auth/refresh");

    await act(async () => {
      await expect(handler(error)).rejects.toBeDefined();
    });

    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("should not intercept 401 on /auth/login", async () => {
    await mountProvider();
    const handler = getInterceptorErrorHandler();
    const error = make401Error("/api/auth/login");

    await act(async () => {
      await expect(handler(error)).rejects.toBeDefined();
    });

    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("should call refreshToken and retry original request on 401", async () => {
    await mountProvider();
    mockRefreshToken.mockResolvedValue({
      id: "1",
      email: "u@test.com",
      role: "user",
      fullName: "User"
    });

    const retrySpy = vi
      .spyOn(api, "request")
      .mockResolvedValue({ data: "retried" });

    const handler = getInterceptorErrorHandler();

    await act(async () => {
      await handler(make401Error());
    });

    expect(mockRefreshToken).toHaveBeenCalledTimes(2);
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it("should logout and reject if refreshToken fails", async () => {
    await mountProvider();
    mockLogoutApi.mockResolvedValue(undefined);
    mockRefreshToken.mockRejectedValue(new Error("Refresh failed"));

    const handler = getInterceptorErrorHandler();

    await act(async () => {
      await expect(handler(make401Error())).rejects.toThrow("Refresh failed");
    });

    expect(mockLogoutApi).toHaveBeenCalledTimes(1);
  });

  it("should queue concurrent 401s while refreshing and flush them on success", async () => {
    await mountProvider();

    let resolveRefresh!: () => void;
    mockRefreshToken.mockReturnValue(
      new Promise<void>((res) => {
        resolveRefresh = res;
      }),
    );

    const retrySpy = vi
      .spyOn(api, "request")
      .mockResolvedValue({ data: "retried" });

    const handler = getInterceptorErrorHandler();

    let p1: unknown, p2: unknown, p3: unknown;

    await act(async () => {
      p1 = handler(make401Error("/api/resource-1"));
      p2 = handler(make401Error("/api/resource-2"));
      p3 = handler(make401Error("/api/resource-3"));

      expect(mockRefreshToken).toHaveBeenCalledTimes(2);

      resolveRefresh();
      await Promise.all([p1, p2, p3]);
    });

    expect(retrySpy).toHaveBeenCalledTimes(3);
  });

  it("should reject all queued requests if refresh fails", async () => {
    await mountProvider();
    mockLogoutApi.mockResolvedValue(undefined);

    let rejectRefresh!: (e: Error) => void;
    mockRefreshToken.mockReturnValue(
      new Promise<void>((_, rej) => {
        rejectRefresh = rej;
      }),
    );

    const handler = getInterceptorErrorHandler();

    let p1: unknown, p2: unknown;

    await act(async () => {
      p1 = handler(make401Error("/api/resource-1"));
      p2 = handler(make401Error("/api/resource-2"));
      rejectRefresh(new Error("Token expired"));

      await expect(p1).rejects.toThrow("Token expired");
      await expect(p2).rejects.toThrow("Token expired");
    });
  });

  it("should eject interceptor on unmount", async () => {
    const ejectSpy = vi.spyOn(api.interceptors.response, "eject");
    const { unmount } = await mountProvider();

    act(() => {
      unmount();
    });

    expect(ejectSpy).toHaveBeenCalledTimes(1);
  });
});

describe("AuthProvider — inizializzazione", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should set user on successful initial refresh", async () => {
    const mockUser = { id: "1", email: "u@test.com", role: "user", fullName: "User" };
    mockRefreshToken.mockResolvedValue(mockUser);
    await mountProvider();
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });

  it("should set user to null if initial refresh fails", async () => {
    mockRefreshToken.mockRejectedValue(new Error("No session"));
    await mountProvider();
    expect(mockRefreshToken).toHaveBeenCalledTimes(1);
  });
});
