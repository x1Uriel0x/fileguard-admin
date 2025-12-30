import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/ui/Header";
import Sidebar from "../../components/ui/Sidebar";
import NavigationBreadcrumb from "../../components/ui/NavigationBreadcrumb";

import MetricsCard from "./components/MetricsCard";
import SystemActivity from "./components/SystemActivity";
import PendingRequests from "./components/PendingRequests";
import UserManagementTable from "./components/UserManagementTable";

import { supabase } from "../../lib/supabase";
import type { User } from "./types";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

 const fetchUsers = async () => {
  setLoadingUsers(true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // rol
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = myProfile?.role === "admin";
  setIsAdmin(isAdmin);

  // perfiles
  let query = supabase.from("profiles").select("*");

  if (!isAdmin) {
    query = query.eq("id", user.id);
  }

  const { data: profiles } = await query;

  //  conteo archivos
  const fileCounts = await loadFileCounts();

  // unir datos
  const formatted = (profiles || []).map((p) => ({
    id: p.id,
    name: p.name || "Sin nombre",
    email: p.email,
    role: p.role as User['role'],
    avatar: p.avatar_url
  ? p.avatar_url
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || "User")}`,

    alt: p.name || "Usuario",
    lastActivity: new Date(p.created_at), // Use joined date as last activity
    status: (p.banned ? "suspended" : "active") as User['status'],
    permissions: [], // Empty permissions array
    filesAccessed: fileCounts[p.id] ?? 0,
    joinedDate: new Date(p.created_at),
    banned: p.banned || false,
  }));

  setUsers(formatted);
  setLoadingUsers(false);
};

  const handleBanToggle = async (userId: string, banned: boolean) => {
  const confirmMsg = banned
    ? "¿Deseas desactivar a este usuario?"
    : "¿Deseas reactivar a este usuario?";

  if (!window.confirm(confirmMsg)) return;

  const { error } = await supabase
    .from("profiles")
    .update({ banned: !banned })
    .eq("id", userId);

  if (error) {
    alert("Error cambiando estado del usuario");
    console.error(error);
    return;
  }

  await fetchUsers(); // refrescar tabla
};

const handleViewPermissions = (userId: string) => {
  // navegar a la página de permisos con el usuario seleccionado
  navigate(`/permission-management?user=${userId}`);
};

const loadFileCounts = async () => {
  const { data, error } = await supabase
    .from("archivos")
    .select("owner_id");

  if (error) {
    console.error("Error loading file counts:", error);
    return {};
  }

  const map: Record<string, number> = {};

  data?.forEach((row: any) => {
    map[row.owner_id] = (map[row.owner_id] || 0) + 1;
  });

  return map;
};

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const totalUsuarios = users.length;
  const sesionesActivas = users.filter((u) => u.status === "active").length;
  const usuariosSuspendidos = users.filter((u) => u.status === "suspended").length;

  const breadcrumbItems = [
    { label: "Inicio", path: "/file-upload" },
    { label: "Panel de Control", path: "/admin-dashboard" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} isAdmin={isAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          showMenuButton
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 pt-16 ml-64">

          <NavigationBreadcrumb customItems={breadcrumbItems} />

          <h1 className="text-3xl font-bold mt-6">Panel de Control</h1>
          <p className="text-muted-foreground mb-8">
            Gestión completa del sistema FileGuard
          </p>

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <MetricsCard
              metric={{
                id: "total-users",
                title: "Total de Usuarios",
                value: totalUsuarios,
                change: 0,
                changeType: "increase",
                icon: "Users",
                description: "Usuarios registrados",
                color: "#4F46E5",
              }}
            />

            <MetricsCard
              metric={{
                id: "active-sessions",
                title: "Sesiones Activas",
                value: sesionesActivas,
                change: 0,
                changeType: "increase",
                icon: "Activity",
                description: "Usuarios activos",
                color: "#16A34A",
              }}
            />
            <MetricsCard
              metric={{
                id: "active-sessions",
                title: "Usuarios Suspendidos",
                value: usuariosSuspendidos,
                change: 0,
                changeType: "increase",
                icon: "Activity",
                description: "Usuarios Restringidos",
                color: "#16A34A",
              }}
            />

          </div>

          {/* USERS TABLE */}
          <div className="mt-10">
          <UserManagementTable
            users={users}
            loading={loadingUsers}
            onViewPermissions={handleViewPermissions}
            onBanToggle={handleBanToggle}
          />


          </div>

          {/* REQUESTS */}
          <div className="mt-10">
            <PendingRequests
              requests={[]}
              onApprove={(id) => console.log("Aprobado:", id)}
              onReject={(id) => console.log("Rechazado:", id)}
            />
          </div>

          {/* ACTIVITY */}
          <div className="mt-10">
            <SystemActivity activities={[]} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
