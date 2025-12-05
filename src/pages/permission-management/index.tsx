import { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserListPanel from './components/UserListPanel';
import PermissionMatrix from './components/PermissionMatrix';
import PermissionTemplates from './components/PermissionTemplates';
import ActivityLog from './components/ActivityLog';
import BulkPermissionModal from './components/BulkPermissionModal';
import type {User, FileCategory, AccessLevel, Permission, PermissionTemplate, PermissionHistory, BulkPermissionUpdate, PermissionConflict} from './types';

const PermissionManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const mockUsers: User[] = [
  {
    id: '1',
    name: 'María García López',
    email: 'maria.garcia@fileguard.com',
    role: 'admin',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_132e84d00-1764653057727.png",
    department: 'Administración',
    status: 'active',
    lastActive: new Date(Date.now() - 300000),
    permissionLevel: 'full'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez Martín',
    email: 'carlos.rodriguez@fileguard.com',
    role: 'user',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_142fd82a3-1764633643467.png",
    department: 'Ventas',
    status: 'active',
    lastActive: new Date(Date.now() - 600000),
    permissionLevel: 'limited'
  },
  {
    id: '3',
    name: 'Ana Fernández Sánchez',
    email: 'ana.fernandez@fileguard.com',
    role: 'user',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19a9bf0ac-1764749863101.png",
    department: 'Marketing',
    status: 'active',
    lastActive: new Date(Date.now() - 900000),
    permissionLevel: 'limited'
  },
  {
    id: '4',
    name: 'Juan Martínez Pérez',
    email: 'juan.martinez@fileguard.com',
    role: 'guest',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_132e84d00-1764653057727.png",
    department: 'Consultoría',
    status: 'inactive',
    lastActive: new Date(Date.now() - 86400000),
    permissionLevel: 'restricted'
  },
  {
    id: '5',
    name: 'Laura González Torres',
    email: 'laura.gonzalez@fileguard.com',
    role: 'user',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ae9ed561-1764691312461.png",
    department: 'Recursos Humanos',
    status: 'active',
    lastActive: new Date(Date.now() - 1200000),
    permissionLevel: 'limited'
  }];


  const mockCategories: FileCategory[] = [
  {
    id: 'cat1',
    name: 'Documentos Financieros',
    description: 'Informes financieros, facturas y documentos contables',
    icon: 'DollarSign',
    fileCount: 245
  },
  {
    id: 'cat2',
    name: 'Recursos Humanos',
    description: 'Contratos, nóminas y documentos de personal',
    icon: 'Users',
    fileCount: 189
  },
  {
    id: 'cat3',
    name: 'Documentos Legales',
    description: 'Contratos, acuerdos y documentos legales',
    icon: 'Scale',
    fileCount: 156
  },
  {
    id: 'cat4',
    name: 'Marketing y Ventas',
    description: 'Materiales de marketing, presentaciones y propuestas',
    icon: 'TrendingUp',
    fileCount: 312
  },
  {
    id: 'cat5',
    name: 'Documentos Técnicos',
    description: 'Especificaciones técnicas, manuales y documentación',
    icon: 'FileCode',
    fileCount: 428
  }];


  const [permissions, setPermissions] = useState<Permission[]>([
  {
    userId: '1',
    categoryId: 'cat1',
    access: { view: true, edit: true, upload: true, delete: true },
    inherited: true,
    customized: false,
    lastModified: new Date(Date.now() - 86400000),
    modifiedBy: 'system'
  },
  {
    userId: '2',
    categoryId: 'cat4',
    access: { view: true, edit: true, upload: true, delete: false },
    inherited: false,
    customized: true,
    lastModified: new Date(Date.now() - 172800000),
    modifiedBy: 'admin1'
  }]
  );

  const mockTemplates: PermissionTemplate[] = [
  {
    id: 'temp1',
    name: 'Administrador Completo',
    description: 'Acceso total a todas las categorías de archivos',
    role: 'admin',
    permissions: mockCategories.map((cat) => ({
      categoryId: cat.id,
      access: { view: true, edit: true, upload: true, delete: true },
      inherited: true,
      customized: false
    }))
  },
  {
    id: 'temp2',
    name: 'Usuario Estándar',
    description: 'Acceso de lectura y edición limitada',
    role: 'user',
    permissions: mockCategories.map((cat) => ({
      categoryId: cat.id,
      access: { view: true, edit: true, upload: false, delete: false },
      inherited: true,
      customized: false
    }))
  },
  {
    id: 'temp3',
    name: 'Invitado de Solo Lectura',
    description: 'Solo puede ver archivos, sin permisos de modificación',
    role: 'guest',
    permissions: mockCategories.map((cat) => ({
      categoryId: cat.id,
      access: { view: true, edit: false, upload: false, delete: false },
      inherited: true,
      customized: false
    }))
  }];


  const mockHistory: PermissionHistory[] = [
  {
    id: 'hist1',
    userId: '2',
    userName: 'Carlos Rodríguez Martín',
    action: 'granted',
    categoryName: 'Marketing y Ventas',
    accessLevel: 'Editar',
    timestamp: new Date(Date.now() - 3600000),
    modifiedBy: 'admin1',
    modifiedByName: 'María García López'
  },
  {
    id: 'hist2',
    userId: '3',
    userName: 'Ana Fernández Sánchez',
    action: 'modified',
    categoryName: 'Documentos Financieros',
    accessLevel: 'Ver',
    timestamp: new Date(Date.now() - 7200000),
    modifiedBy: 'admin1',
    modifiedByName: 'María García López'
  },
  {
    id: 'hist3',
    userId: '4',
    userName: 'Juan Martínez Pérez',
    action: 'revoked',
    categoryName: 'Recursos Humanos',
    accessLevel: 'Subir',
    timestamp: new Date(Date.now() - 10800000),
    modifiedBy: 'admin1',
    modifiedByName: 'María García López'
  }];


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
        modifiedBy: 'admin1'
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newPermission;
        return updated;
      }

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

  const handleApplyTemplate = (templateId: string) => {
    if (!selectedUser) return;

    const template = mockTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newPermissions = template.permissions.map((p) => ({
      ...p,
      userId: selectedUser.id,
      lastModified: new Date(),
      modifiedBy: 'admin1'
    }));

    setPermissions((prev) => [
    ...prev.filter((p) => p.userId !== selectedUser.id),
    ...newPermissions]
    );

    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    console.log('Guardando cambios de permisos...');
    setHasUnsavedChanges(false);
  };

  const handleBulkUpdate = (
  userIds: string[],
  categoryId: string,
  access: AccessLevel) =>
  {
    const newPermissions = userIds.map((userId) => ({
      userId,
      categoryId,
      access,
      inherited: false,
      customized: true,
      lastModified: new Date(),
      modifiedBy: 'admin1'
    }));

    setPermissions((prev) => {
      const filtered = prev.filter(
        (p) => !userIds.includes(p.userId) || p.categoryId !== categoryId
      );
      return [...filtered, ...newPermissions];
    });

    setHasUnsavedChanges(true);
  };

  const userPermissions = selectedUser ?
  permissions.filter((p) => p.userId === selectedUser.id) :
  [];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        showMenuButton={true} />


      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} />


      <main
        className={`
          pt-16 transition-all duration-300
          ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}
        `}>

        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <NavigationBreadcrumb customItems={[]} />
            <div className="flex items-center justify-between mt-4">
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
                  onClick={() => setIsBulkModalOpen(true)}>

                  Actualización Masiva
                </Button>
                {hasUnsavedChanges &&
                <Button
                  variant="default"
                  iconName="Save"
                  iconPosition="left"
                  onClick={handleSaveChanges}>

                    Guardar Cambios
                  </Button>
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg overflow-hidden h-[calc(100vh-240px)]">
                <UserListPanel
                  users={mockUsers}
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser} />

              </div>
            </div>

            <div className="lg:col-span-6">
              {selectedUser ?
              <div className="bg-card border border-border rounded-lg overflow-hidden h-[calc(100vh-240px)]">
                  <PermissionMatrix
                  categories={mockCategories}
                  permissions={userPermissions}
                  userId={selectedUser.id}
                  onPermissionChange={handlePermissionChange}
                  onResetToRole={handleResetToRole} />

                </div> :

              <div className="bg-card border border-border rounded-lg h-[calc(100vh-240px)] flex items-center justify-center">
                  <div className="text-center p-8">
                    <Icon
                    name="UserCheck"
                    size={64}
                    className="text-muted-foreground mx-auto mb-4" />

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Seleccione un Usuario
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Elija un usuario de la lista para ver y modificar sus
                      permisos de acceso a archivos
                    </p>
                  </div>
                </div>
              }
            </div>

            <div className="lg:col-span-3 space-y-6">
              <PermissionTemplates
                templates={mockTemplates}
                onApplyTemplate={handleApplyTemplate}
                onSaveAsTemplate={() => console.log('Guardar como plantilla')} />


              <ActivityLog history={mockHistory} />
            </div>
          </div>
        </div>
      </main>

      <BulkPermissionModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        users={mockUsers}
        categories={mockCategories}
        onApply={handleBulkUpdate} />

    </div>);

};

export default PermissionManagement;