import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

const LoginPage = lazyWithLoader(() => import("../pages/LoginPage"));
const GenerateTicketPage = lazyWithLoader(
  () => import("../pages/GenerateTicketPage"),
);
const DashboardPage = lazyWithLoader(() => import("../pages/DashboardPage"));
const UsersListPage = lazyWithLoader(
  () => import("../pages/users/UsersListPage"),
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<DashboardPage />} />
        <Route path="/ai" element={<GenerateTicketPage />} />
        <Route path="/users" element={<UsersListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
