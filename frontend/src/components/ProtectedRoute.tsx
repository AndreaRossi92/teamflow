import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import type { Role } from "../types/user";

type ProtectedRouteProps = { allowedRoles?: Role[] };

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role))
    return <Navigate to="/not-found" />;

  return <Outlet />;
}
