import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import type { PropsWithChildren } from "react";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
