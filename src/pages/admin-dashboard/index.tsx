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

    //Usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // No hay sesión → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Perfil REAL desde profiles
    const { data: myProfile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !myProfile) {
      console.error("Error loading role:", roleError);
      navigate("/login", { replace: true });
      return;
    }

    const admin = myProfile.role === "admin";
    setIsAdmin(admin);

    //SI NO ES ADMIN → FUERA DEL DASHBOARD
    if (!admin) {
      navigate("/file-upload", { replace: true });
      return;
    }

    // Admin → puede ver todos los perfiles
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading profiles:", error);
      setLoadingUsers(false);
      return;
    }

    

    // Formatear datos
    const formatted: User[] = (data || []).map((p) => ({
    id: p.id,
    name: p.name || "Sin nombre",
    email: p.email,
    role: p.role,
    banned: p.banned ?? false, // 👈 CLAVE
    avatar:
      p.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        p.name || "User"
      )}`,
    alt: p.name || "User",
    status: p.banned ? "banned" : "active",
    lastActivity: new Date(p.created_at),
    permissions: [],
    filesAccessed: 0,
    joinedDate: new Date(p.created_at),
  }));


    setUsers(formatted);
    setLoadingUsers(false);
  };

  const handleBanToggle = async (userId: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from("profiles")
    .update({ banned: !currentStatus })
    .eq("id", userId);

  if (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return;
  }

  // refrescar usuarios
  await fetchUsers();
};

const handleViewPermissions = (userId: string) => {
  // navegar a la página de permisos con el usuario seleccionado
  navigate(`/permission-management?user=${userId}`);
};


  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const totalUsuarios = users.length;
  const sesionesActivas = users.filter((u) => u.status === "active").length;

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
          </div>

          {/* USERS TABLE */}
          <div className="mt-10">
            <UserManagementTable
            users={users}
            loading={loadingUsers}
            onEditUser={(id) => {
              const u = users.find((u) => u.id === id);
              if (!u) return;
              handleBanToggle(u.id, u.banned);
            }}
            onViewPermissions={handleViewPermissions}
            onRefreshUsers={fetchUsers}
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
