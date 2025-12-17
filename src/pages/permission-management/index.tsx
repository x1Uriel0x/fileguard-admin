import React, { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import Sidebar from "../../components/ui/Sidebar";
import NavigationBreadcrumb from "../../components/ui/NavigationBreadcrumb";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import UserListPanel from "./components/UserListPanel";
import PermissionMatrix from "./components/PermissionMatrix";
import PermissionTemplates from "./components/PermissionTemplates";
import ActivityLog from "./components/ActivityLog";
import BulkPermissionModal from "./components/BulkPermissionModal";

import { supabase } from "../../lib/supabase";
import type {
  User,
  FileCategory,
  Permission,
  PermissionTemplate,
  PermissionHistory,
  AccessLevel
} from "./types";

const PermissionManagement: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  
  // real data states
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [history, setHistory] = useState<PermissionHistory[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]); // all permissions loaded (for all users or filtered)
  const [loading, setLoading] = useState(true);
  //const [folders, setFolders] = useState<Folder[]>([]);
 
  

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadCategories(), loadTemplates(), loadHistory()]);
      setLoading(false);
    })();
  }, []);

  // Load all users from profiles
  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando users:", error);
      setUsers([]);
      return;
    }

    setUsers(
      (data || []).map((u: any) => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email ?? "",
        role: u.role ?? "user",
        avatar: u.avatar_url ?? "",
        department: u.department ?? "",
        status: "active",
        lastActive: new Date(u.updated_at || u.created_at || Date.now()),
        permissionLevel: "limited"
      }))
    );
  };

  // Load categories frm table
  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando folders as categories:", error);
      setCategories([]);
      return;
    }

    setCategories(
      (data || []).map((f: any) => ({
        id: f.id,
        name: f.name ?? "Sin nombre",
        description: f.description ?? "",
        icon: "Folder",
        fileCount: f.file_count ?? 0
      }))
    );
  };

  // Load permission templa
  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("permission_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      
      setTemplates([]);
      return;
    }

    
    setTemplates((data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      role: t.role || "user",
      permissions: t.permissions || []
    })));
  };

  // carga permission hitory
  const loadHistory = async () => {
  const { data, error } = await supabase
    .from("permission_history") 
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error cargando historial:", error);
    return;
  }

 const history: PermissionHistory[] = await Promise.all(
  data.map(async (row: any) => {
   
    const currentUser = (await supabase.auth.getUser()).data.user;

    const { data: user } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", row.userId)
      .single();
//verofy folders
    const { data: permission } = await supabase
      .from("folder_permissions")
      .select("can_view")
      .eq("folder_id", row.folderId)
      .eq("user_id", currentUser?.id)
      .single();

   //carga als carpetas solo si se pueden ver 
    let folderName = "Sin acceso";

    if (permission?.can_view) {
      const { data: folder } = await supabase
        .from("folders")
        .select("name")
        .eq("id", row.folderId)
        .single();

      folderName = folder?.name ?? "Carpeta";
    }

    // Usuario q modify
    const { data: modUser } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", row.changedBy)
      .single();

    return {
      id: row.id,
      userId: row.userId,
      userName: user?.name ?? "Usuario",
      categoryName: folderName,
      accessLevel: row.accessLevel ?? "read",
      action: row.action,
      timestamp: new Date(row.timestamp),
      modifiedBy: row.changedBy,
      modifiedByName: modUser?.name ?? "Administrador",
    };
  })
);


  setHistory(history);
};

  // Load permisos from user seleccionado
  const loadUserPermissions = async (userId: string) => {
  const { data, error } = await supabase
    .from("folder_permissions")
    .select(`
      id,
      folder_id,
      can_view,
      can_edit,
      can_upload,
      created_at,
      updated_at,
      folders (
        id,
        name
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading permissions:", error);
    return;
  }


  const userPermissions: Permission[] = (data || []).map((p) => ({
  id: p.id,
  userId,
  categoryId: p.folder_id,
  categoryName: p.folders?.[0]?.name ?? "Carpeta",
  access: {
    view: !!p.can_view,
    edit: !!p.can_edit,
    upload: !!p.can_upload,
    delete: false,
  },
  inherited: false,
  customized: true,
  lastModified: new Date(p.updated_at || p.created_at),
  modifiedBy: "admin",
}));


  // CLAVE: mantener permisos de otros usuarios
  setPermissions((prev) => {
    const filtered = prev.filter((perm) => perm.userId !== userId);
    return [...filtered, ...userPermissions];
  });
};

  
  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  // Handle checkbox changes in matrix
  const handlePermissionChange = (categoryId: string, access: AccessLevel) => {
  if (!selectedUser) return;

  setPermissions((prev) => {
    const existingIndex = prev.findIndex(
      (p) => p.userId === selectedUser.id && p.categoryId === categoryId
    );

    const newPermission: Permission = {
      userId: selectedUser.id,
      categoryId,
      access,
      inherited: false,
      customized: true,
      lastModified: new Date(),
      modifiedBy: "admin" // luego lo cambiamos al admin real
    };

    if (existingIndex >= 0) {
      // reemplazar el permiso existente
      const updated = [...prev];
      updated[existingIndex] = newPermission;
      return updated;
    }

    // agregar un permiso nuevo
    return [...prev, newPermission];
  });

  setHasUnsavedChanges(true);
};



  const handleResetToRole = () => {
    if (!selectedUser) return;

   
    setPermissions((prev) =>
      prev.filter((p) => p.userId !== selectedUser.id || !p.customized)
    );

    setHasUnsavedChanges(true);
  };

  // Apply a template to selected user
  const handleApplyTemplate = (templateId: string) => {
    if (!selectedUser) return;
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newPermissions = template.permissions.map((p: any) => ({
      ...p,
      userId: selectedUser.id,
      lastModified: new Date(),
      modifiedBy: "admin"
    })) as Permission[];

    setPermissions((prev) => [
      ...prev.filter((p) => p.userId !== selectedUser.id),
      ...newPermissions
    ]);

    setHasUnsavedChanges(true);
  };

  
  // Save all permissions for selected user to DB
  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const userPerms = permissions.filter((p) => p.userId === selectedUser.id && p.customized);

      for (const p of userPerms) {
        // If permission row has id -> update, else upsert by unique keys (user_id, folder_id)
        if ((p as any).id) {
          const { error } = await supabase
            .from("folder_permissions")
            .update({
              can_view: p.access.view,
              can_edit: p.access.edit,
              can_upload: p.access.upload,
              can_delete: p.access.delete,
              updated_at: new Date(),
              updated_by: p.modifiedBy
            })
            .eq("id", (p as any).id);

          if (error) console.error("Error updating permission:", error);
        } else {
          // try upsert with conflict resolution on (user_id, folder_id)
          const { error } = await supabase.from("folder_permissions").upsert(
            {
              user_id: p.userId,
              folder_id: p.categoryId,
              can_view: p.access.view,
              can_edit: p.access.edit,
              can_upload: p.access.upload,
              //can_delete: p.access.delete,
              //created_at: new Date(),
              //updated_at: new Date(),
              //updated_by: p.modifiedBy
            },
            { onConflict: "user_id,folder_id" }
          );
          if (error) console.error("Error upserting permission:", error);
        }
      }

      // optional: write to permission_history table
      await supabase.from("permission_history").insert(
        userPerms.map((p) => ({
          user_id: p.userId,
          folder_id: p.categoryId,
          action: "modified",
          changed_by: "admin",
          created_at: new Date()
        }))
      );

      setHasUnsavedChanges(false);
      // reload permissions for this user to sync ids and timestamps
      await loadUserPermissions(selectedUser.id);
      alert("Permisos guardados correctamente");
    } catch (err) {
      console.error("Error guardando permisos:", err);
      alert("Error guardando permisos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk update helper (applies access to many users for a category)
  const handleBulkUpdate = async (
    userIds: string[],
    categoryId: string,
    access: AccessLevel
  ) => {
    if (!userIds || userIds.length === 0) return;

    // update local state
    const newPermissions = userIds.map((userId) => ({
      userId,
      categoryId,
      access,
      inherited: false,
      customized: true,
      lastModified: new Date(),
      modifiedBy: "admin"
    }));

    setPermissions((prev) => {
      const filtered = prev.filter(
        (p) => !userIds.includes(p.userId) || p.categoryId !== categoryId
      );
      return [...filtered, ...newPermissions];
    });

    setHasUnsavedChanges(true);

  
  };
const [isAdmin] = useState(false);

const handleSelectUser = (user: User) => {
  setHasUnsavedChanges(false);
  setSelectedUser(user);
  loadUserPermissions(user.id); // 🔥 usa el id
};



  
  const userPermissions = selectedUser
    ? permissions.filter((p) => p.userId === selectedUser.id)
    : [];

  return (
    <div className="flex min-h-screen bg-background">

      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        showMenuButton={true}
      />

      <Sidebar
  isCollapsed={isSidebarCollapsed}
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  isAdmin={isAdmin}
/>
  <main
  className={`
    pt-16
    transition-all duration-300
    h-[calc(100vh-4rem)]
    overflow-y-auto
    ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}
  `}
>
         <div className="mx-auto w-full max-w-7x1 p-10 lg:p-0 flex flex-col">
          <div className="flex-shrink-0 pb-5">
            <NavigationBreadcrumb customItems={[]} />
            <div className="flex items-center justify-between pt-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Gestión de Permisos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Administre los permisos de acceso a archivos para usuarios y roles
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  iconName="Users"
                  iconPosition="left"
                  onClick={() => setIsBulkModalOpen(true)}
                >
                  Actualización Masiva
                </Button>
                {hasUnsavedChanges && (
                  <Button
                    variant="default"
                    iconName="Save"
                    iconPosition="left"
                    onClick={handleSaveChanges}
                  >
                    Guardar Cambios
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <div className="bg-card border border-border rounded-lg overflow-auto h-full">
                <UserListPanel
                  users={users}
                  selectedUser={selectedUser}
                  onUserSelect={handleSelectUser}
                />
              </div>
            </div>

            <div className="lg:flex-1">
              {selectedUser ? (
                <div className="bg-card border border-border rounded-lg h-full">
                  <PermissionMatrix
                    categories={categories}
                    permissions={userPermissions}
                    userId={selectedUser.id}
                    onPermissionChange={handlePermissionChange}
                    onResetToRole={handleResetToRole}
                  />
                  <div className="p-4 flex justify-end">
                    {hasUnsavedChanges && (
                      <Button variant="default" onClick={handleSaveChanges}>
                        Guardar Cambios
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Icon
                      name="UserCheck"
                      size={64}
                      className="text-muted-foreground mx-auto mb-4"
                    />

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Seleccione un Usuario
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[1200px]">
                      Elija un usuario de la lista para ver y modificar sus permisos
                      de acceso a archivos
                    </p>
                  </div>
                </div>
              )}
            </div>

              <div className="lg:w-1/4 h-full min-h-0">
                <div className="bg-card border border-border rounded-lg overflow-auto h-full space-y-6 p-4">
                  <PermissionTemplates
                    templates={templates}
                    onApplyTemplate={handleApplyTemplate}
                    onSaveAsTemplate={async (name: string, templatePermissions: any[]) => {
                      // optional: save new template
                      const { error } = await supabase.from("permission_templates").insert({
                        name,
                        description: "Guardada desde UI",
                        role: selectedUser?.role ?? "user",
                        permissions: templatePermissions,
                        created_at: new Date()
                      });

                      if (error) {
                        console.error("Error saving template:", error);
                        return;
                      }

                      // reload templates
                      await loadTemplates();
                    }}
                  />

                  <ActivityLog history={history} />
                </div>
            </div>
            </div>
          </div>
        </div>
  </main>

      <BulkPermissionModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        users={users}
        categories={categories}
        onApply={handleBulkUpdate}
      />
    </div>
  );
};

export default PermissionManagement;

// : )