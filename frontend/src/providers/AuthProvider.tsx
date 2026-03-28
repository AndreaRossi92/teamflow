import { useState, type PropsWithChildren } from "react";
import type { AuthUser } from "../types/authUser";
import { AuthContext } from "./Auth.Context";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
