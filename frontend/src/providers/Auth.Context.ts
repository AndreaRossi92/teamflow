import { createContext } from "react";
import type { AuthUser } from "../types/authUser";

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);
