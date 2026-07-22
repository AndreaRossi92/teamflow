import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PageLoader from "../components/PageLoader";

const lazyWithLoader = (
  importFn: () => Promise<{ default: ComponentType }>,
) => {
  const LazyComponent = lazy(importFn);
  return () => (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent />
    </Suspense>
  );
};

const NotFoundPage = lazyWithLoader(() => import("../pages/NotFoundPage"));
const LoginPage = lazyWithLoader(
  () => import("../features/auth/pages/LoginPage"),
);
const DashboardPage = lazyWithLoader(() => import("../pages/DashboardPage"));
const UsersListPage = lazyWithLoader(
  () => import("../features/user/pages/UsersListPage"),
);
const UserDetailPage = lazyWithLoader(
  () => import("../features/user/pages/UserDetailPage"),
);
const UserEditPage = lazyWithLoader(
  () => import("../features/user/pages/UserEditPage"),
);
const UserCreatePage = lazyWithLoader(
  () => import("../features/user/pages/UserCreatePage"),
);
const ChangePasswordPage = lazyWithLoader(
  () => import("../features/auth/pages/ChangePasswordPage"),
);
const ResetPasswordPage = lazyWithLoader(
  () => import("../features/user/pages/ResetPasswordPage"),
);
const ProjectsListPage = lazyWithLoader(
  () => import("../features/project/pages/ProjectsListPage"),
);
const ProjectDetailPage = lazyWithLoader(
  () => import("../features/project/pages/ProjectDetailPage"),
);
const ProjectEditPage = lazyWithLoader(
  () => import("../features/project/pages/ProjectEditPage"),
);
const ProjectCreatePage = lazyWithLoader(
  () => import("../features/project/pages/ProjectCreatePage"),
);
const ProjectAssignUsersPage = lazyWithLoader(
  () => import("../features/project/pages/ProjectAssignUsersPage"),
);
const TicketsListPage = lazyWithLoader(
  () => import("../features/ticket/pages/TicketsListPage"),
);
const TicketDetailtPage = lazyWithLoader(
  () => import("../features/ticket/pages/TicketDetailPage"),
);
const TicketCreatePage = lazyWithLoader(
  () => import("../features/ticket/pages/TicketCreatePage"),
);
const TicketEditPage = lazyWithLoader(
  () => import("../features/ticket/pages/TicketEditPage"),
);
const TicketAssignUsersPage = lazyWithLoader(
  () => import("../features/ticket/pages/TicketAssignUsersPage"),
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/tickets" element={<TicketsListPage />} />
        <Route path="/ticket/:id" element={<TicketDetailtPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/user/create" element={<UserCreatePage />} />
        <Route path="/user/:id" element={<UserDetailPage />} />
        <Route path="/user/:id/edit" element={<UserEditPage />} />
        <Route
          path="/user/:id/reset-password"
          element={<ResetPasswordPage />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route path="/project/create" element={<ProjectCreatePage />} />
        <Route path="/project/:id/edit" element={<ProjectEditPage />} />
        <Route
          path="/project/:id/assign-users"
          element={<ProjectAssignUsersPage />}
        />
        <Route path="/ticket/create" element={<TicketCreatePage />} />
        <Route path="/ticket/:id/edit" element={<TicketEditPage />} />
        <Route
          path="/ticket/:id/assign-users"
          element={<TicketAssignUsersPage />}
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
