import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";

import AdminDashboard from './pages/admin-dashboard';
import Login from './pages/login';
import PermissionManagement from './pages/permission-management';
import Register from './pages/register';
import FileUpload from './pages/file-upload';

import AuthRoleGuard from "./components/ui/AuthRoleGuard"; 

import ProfilePage from "./pages/profile";
import SettingsPage from "./pages/settings";


const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouterRoutes>

        {/* 🔵 LOGIN Y REGISTRO (PÚBLICOS) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🟣 PÁGINA PRINCIPAL → LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 👑 SOLO ADMIN */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AuthRoleGuard allowedRoles={["Administrador", "admin"]}>
              <AdminDashboard />
            </AuthRoleGuard>
          } 
        />

        <Route 
          path="/permission-management" 
          element={
            <AuthRoleGuard allowedRoles={["Administrador", "admin"]}>
              <PermissionManagement />
            </AuthRoleGuard>
          } 
        />

        {/* 🟢 TODOS LOS USUARIOS AUTENTICADOS */}
        <Route 
          path="/file-upload" 
          element={
            <AuthRoleGuard allowedRoles={["Administrador", "admin", "Usuario", "Invitado"]}>
              <FileUpload />
            </AuthRoleGuard>
          }
        />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />
        
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
          

      </RouterRoutes>
    </BrowserRouter>
  );
};

export default Routes;
