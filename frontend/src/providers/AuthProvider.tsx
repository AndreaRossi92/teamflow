import {
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "../features/auth/types/authUser";
import { AuthContext } from "./Auth.Context";
import { logout as logoutApi } from "../features/auth/api";
import { api } from "../api/axios.instance";
import { setupAuthInterceptor } from "./setupAuthInterceptor";
import { refreshCoordinator } from "./refreshCoordinator";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(!isDemoMode);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const teardown = setupAuthInterceptor(api, {
      onRefreshSuccess: setUser,
      onRefreshFailure: logout,
    });

    return teardown;
  }, [logout]);

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    refreshCoordinator
      .refresh()
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
