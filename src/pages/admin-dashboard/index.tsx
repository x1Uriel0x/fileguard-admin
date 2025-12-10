import React, { useEffect, useState } from "react";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load REAL users from Supabase -> profiles table
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingUsers(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading profiles:", error);
        setLoadingUsers(false);
        return;
      }

      const formatted: User[] = data.map((p) => ({
        id: p.id,
        name: p.name || "Sin nombre",
        email: p.email,
        role: (p.role as "admin" | "user" | "guest") || "user",
        avatar:
          p.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            p.name || "User"
          )}`,
        alt: p.name,
        status: "active",
        lastActivity: new Date(),
        permissions: [],
        filesAccessed: 0,
        joinedDate: new Date(p.created_at),
      }));

      setUsers(formatted);
      setLoadingUsers(false);
    };

    fetchProfiles();
  }, []);

  const totalUsuarios = users.length;
  const sesionesActivas = users.filter((u) => u.status === "active").length;

  const operacionesArchivos = 0;
  const solicitudesPendientes = 0;

  const breadcrumbItems = [
    { label: "Inicio", path: "/admin-dashboard" },
    { label: "Panel de Control", path: "/admin-dashboard" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          showMenuButton={true}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">

          {/* FIXED: NavigationBreadcrumb uses customItems */}
          <NavigationBreadcrumb customItems={breadcrumbItems} />

          <h1 className="text-3xl font-bold mt-6">Panel de Control</h1>
          <p className="text-muted-foreground mb-8">
            Gestión completa del sistema FileGuard
          </p>

          {/* METRICS CARDS */}
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
                id: "file-ops",
                title: "Operaciones de Archivos",
                value: operacionesArchivos,
                change: 0,
                changeType: "increase",
                icon: "Folder",
                description: "Acciones del sistema",
                color: "#2563EB",
              }}
            />

            <MetricsCard
              metric={{
                id: "pending-requests",
                title: "Solicitudes Pendientes",
                value: solicitudesPendientes,
                change: 0,
                changeType: "increase",
                icon: "AlertCircle",
                description: "Solicitudes recientes",
                color: "#DC2626",
              }}
            />
          </div>

          {/* TABLE: Users */}
          <div className="mt-10">
            <UserManagementTable
              users={users}
              loading={loadingUsers}
              onEditUser={(id) => console.log("Editar usuario:", id)}
              onViewPermissions={(id) => console.log("Ver permisos del usuario:", id)}
            />
          </div>

          {/* FIXED: PendingRequests uses pendingItems */}
          <div className="mt-10">
            <PendingRequests 
          requests={[]} 
          onApprove={(id) => console.log("Aprobado:", id)} 
          onReject={(id) => console.log("Rechazado:", id)}  
          />

          </div>

          {/* FIXED: SystemActivity uses activity */}
          <div className="mt-10">
            <SystemActivity activities={[]} />

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
