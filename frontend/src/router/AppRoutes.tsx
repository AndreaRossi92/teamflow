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
const LoginPage = lazyWithLoader(() => import("../pages/auth/LoginPage"));
const GenerateTicketPage = lazyWithLoader(
  () => import("../pages/GenerateTicketPage"),
);
const DashboardPage = lazyWithLoader(() => import("../pages/DashboardPage"));
const UsersListPage = lazyWithLoader(
  () => import("../pages/users/UsersListPage"),
);
const UserDetailPage = lazyWithLoader(
  () => import("../pages/users/UserDetailPage"),
);
const UserEditPage = lazyWithLoader(
  () => import("../pages/users/UserEditPage"),
);
const UserCreatePage = lazyWithLoader(
  () => import("../pages/users/UserCreatePage"),
);
const ChangePasswordPage = lazyWithLoader(
  () => import("../pages/auth/ChangePasswordPage"),
);
const ResetPasswordPage = lazyWithLoader(
  () => import("../pages/users/ResetPasswordPage"),
);
const ProjectsListPage = lazyWithLoader(
  () => import("../pages/projects/ProjectsListPage"),
);
const ProjectDetailPage = lazyWithLoader(
  () => import("../pages/projects/ProjectDetailPage"),
);
const ProjectEditPage = lazyWithLoader(
  () => import("../pages/projects/ProjectEditPage"),
);
const ProjectCreatePage = lazyWithLoader(
  () => import("../pages/projects/ProjectCreatePage"),
);
const ProjectAssignUsersPage = lazyWithLoader(
  () => import("../pages/projects/ProjectAssignUsersPage"),
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
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/ai" element={<GenerateTicketPage />} />
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
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
