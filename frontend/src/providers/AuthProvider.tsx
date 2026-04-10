import {
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "../types/authUser";
import { AuthContext } from "./Auth.Context";
import { refreshToken, logout as logoutApi } from "../api/auth";
import { api } from "../api/axios.instance";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isRefreshing = false;
    let pendingQueue: Array<{
      resolve: () => void;
      reject: (reason?: unknown) => void;
    }> = [];

    function flushQueue(error: unknown = null): void {
      pendingQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(),
      );
      pendingQueue = [];
    }

    const SKIP_REFRESH_URLS = ["/auth/refresh", "/auth/login"];

    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const requestUrl: string = error.config?.url ?? "";

        if (
          error.response?.status !== 401 ||
          SKIP_REFRESH_URLS.some((url) => requestUrl.includes(url)) ||
          isDemoMode
        ) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise<void>((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          }).then(() => api.request(error.config));
        }

        isRefreshing = true;

        try {
          await refreshToken();
          flushQueue();
          return api.request(error.config);
        } catch (refreshError) {
          flushQueue(refreshError);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      },
    );

    // Remove the interceptor when the component unmounts
    return () => api.interceptors.response.eject(interceptorId);
  }, [logout]);

  useEffect(() => {
    if (isDemoMode) setIsLoading(false);
    else
      refreshToken()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated: user !== null }}
    >
      {children}
    </AuthContext.Provider>
  );
}
