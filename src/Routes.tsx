import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin-dashboard";
import Login from "./pages/login";
import PermissionManagement from "./pages/permission-management";
import Register from "./pages/register";
import FileUpload from "./pages/file-upload";
import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings";

import AuthRoleGuard from "./components/ui/AuthRoleGuard";

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouterRoutes>

        {/* 🔵 PÚBLICOS */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 👑 SOLO ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <AuthRoleGuard allowedRoles={["admin"]}>
              <AdminDashboard />
            </AuthRoleGuard>
          }
        />

        <Route
          path="/permission-management"
          element={
            <AuthRoleGuard allowedRoles={["admin"]}>
              <PermissionManagement />
            </AuthRoleGuard>
          }
        />

        {/* 🟢 USUARIOS Y ADMIN */}
        <Route
          path="/file-upload"
          element={
            <AuthRoleGuard allowedRoles={["admin", "user"]}>
              <FileUpload />
            </AuthRoleGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthRoleGuard allowedRoles={["admin", "user"]}>
              <ProfilePage />
            </AuthRoleGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <AuthRoleGuard allowedRoles={["admin", "user"]}>
              <SettingsPage />
            </AuthRoleGuard>
          }
        />

        {/* ❌ 404 — SIEMPRE AL FINAL */}
        <Route path="*" element={<NotFound />} />

      </RouterRoutes>
    </BrowserRouter>
  );
};

export default Routes;
