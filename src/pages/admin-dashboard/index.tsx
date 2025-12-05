import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';
import UserManagementTable from './components/UserManagementTable';
import PermissionOverview from './components/PermissionOverview';
import SystemActivity from './components/SystemActivity';
import PendingRequests from './components/PendingRequests';
import type { User, MetricCard, FileOperation, PermissionRequest, ChartData, TabType } 
from "./types";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('users');

const metrics: MetricCard[] = [

  {
    id: '1',
    title: 'Total de Usuarios',
    value: 248,
    change: 12.5,
    changeType: 'increase',
    icon: 'Users',
    description: '+31 nuevos este mes',
    color: 'var(--color-primary)'
  },
  {
    id: '2',
    title: 'Sesiones Activas',
    value: 156,
    change: 8.2,
    changeType: 'increase',
    icon: 'Activity',
    description: 'Usuarios conectados ahora',
    color: 'var(--color-success)'
  },
  {
    id: '3',
    title: 'Operaciones de Archivos',
    value: '1,234',
    change: 5.7,
    changeType: 'decrease',
    icon: 'FileText',
    description: 'En las últimas 24 horas',
    color: 'var(--color-accent)'
  },
  {
    id: '4',
    title: 'Solicitudes Pendientes',
    value: 12,
    change: 15.3,
    changeType: 'increase',
    icon: 'AlertCircle',
    description: 'Requieren atención',
    color: 'var(--color-warning)'
  }];


  const users: User[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@fileguard.com',
    role: 'admin',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ed5dd56b-1764653072518.png",
    alt: 'Hombre profesional con camisa azul sonriendo en oficina moderna',
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    status: 'active',
    permissions: [
    { resource: 'documents', action: 'admin' },
    { resource: 'users', action: 'admin' }],

    filesAccessed: 145,
    joinedDate: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@fileguard.com',
    role: 'user',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_150c1be65-1763294957785.png",
    alt: 'Mujer profesional con blazer gris en ambiente de oficina',
    lastActivity: new Date(Date.now() - 1000 * 60 * 45),
    status: 'active',
    permissions: [
    { resource: 'documents', action: 'read' },
    { resource: 'documents', action: 'write' }],

    filesAccessed: 89,
    joinedDate: new Date('2023-03-20')
  },
  {
    id: '3',
    name: 'Juan Martínez',
    email: 'juan.martinez@fileguard.com',
    role: 'user',
    avatar: "https://images.unsplash.com/flagged/photo-1559640196-f5eda7ebf330",
    alt: 'Hombre joven con gafas y camisa blanca en escritorio',
    lastActivity: new Date(Date.now() - 1000 * 60 * 120),
    status: 'active',
    permissions: [{ resource: 'documents', action: 'read' }],
    filesAccessed: 56,
    joinedDate: new Date('2023-05-10')
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@fileguard.com',
    role: 'user',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bee02045-1764644110515.png",
    alt: 'Mujer con cabello castaño y suéter azul sonriendo',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'inactive',
    permissions: [
    { resource: 'documents', action: 'read' },
    { resource: 'documents', action: 'write' }],

    filesAccessed: 34,
    joinedDate: new Date('2023-06-15')
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@fileguard.com',
    role: 'guest',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b9e02935-1763292436908.png",
    alt: 'Hombre con barba y camisa negra en fondo neutro',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'suspended',
    permissions: [{ resource: 'documents', action: 'read' }],
    filesAccessed: 12,
    joinedDate: new Date('2023-08-01')
  }];


  const roleDistribution: ChartData[] = [
  { name: 'Administradores', value: 45, color: 'var(--color-primary)' },
  { name: 'Usuarios', value: 178, color: 'var(--color-accent)' },
  { name: 'Invitados', value: 25, color: 'var(--color-secondary)' }];


  const accessLevels: ChartData[] = [
  { name: 'Acceso Total', value: 45, color: 'var(--color-primary)' },
  { name: 'Lectura y Escritura', value: 123, color: 'var(--color-accent)' },
  { name: 'Solo Lectura', value: 80, color: 'var(--color-warning)' }];


  const activities: FileOperation[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Carlos Rodríguez',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ed5dd56b-1764653072518.png",
    userAlt: 'Hombre profesional con camisa azul sonriendo en oficina moderna',
    operation: 'upload',
    fileName: 'Informe_Trimestral_Q4.pdf',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'success',
    details: 'Archivo subido correctamente al directorio de informes'
  },
  {
    id: '2',
    userId: '2',
    userName: 'María González',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_150c1be65-1763294957785.png",
    userAlt: 'Mujer profesional con blazer gris en ambiente de oficina',
    operation: 'edit',
    fileName: 'Presupuesto_2024.xlsx',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'success',
    details: 'Modificaciones guardadas en la hoja de cálculo'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Juan Martínez',
    userAvatar: "https://images.unsplash.com/flagged/photo-1559640196-f5eda7ebf330",
    userAlt: 'Hombre joven con gafas y camisa blanca en escritorio',
    operation: 'view',
    fileName: 'Manual_Usuario.pdf',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'success',
    details: 'Documento visualizado desde el portal web'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Ana López',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bee02045-1764644110515.png",
    userAlt: 'Mujer con cabello castaño y suéter azul sonriendo',
    operation: 'share',
    fileName: 'Presentación_Proyecto.pptx',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'success',
    details: 'Archivo compartido con 3 usuarios del equipo'
  },
  {
    id: '5',
    userId: '5',
    userName: 'Pedro Sánchez',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b9e02935-1763292436908.png",
    userAlt: 'Hombre con barba y camisa negra en fondo neutro',
    operation: 'delete',
    fileName: 'Borrador_Antiguo.docx',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    status: 'failed',
    details: 'Error: Permisos insuficientes para eliminar el archivo'
  }];


  const permissionRequests: PermissionRequest[] = [
  {
    id: '1',
    userId: '3',
    userName: 'Juan Martínez',
    userAvatar: "https://images.unsplash.com/flagged/photo-1559640196-f5eda7ebf330",
    userAlt: 'Hombre joven con gafas y camisa blanca en escritorio',
    requestedPermission: { resource: 'documents', action: 'write' },
    reason: 'Necesito editar documentos del proyecto para actualizar información crítica',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'pending'
  },
  {
    id: '2',
    userId: '4',
    userName: 'Ana López',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bee02045-1764644110515.png",
    userAlt: 'Mujer con cabello castaño y suéter azul sonriendo',
    requestedPermission: { resource: 'reports', action: 'read' },
    reason: 'Requiero acceso a los informes mensuales para análisis de datos',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'pending'
  },
  {
    id: '3',
    userId: '5',
    userName: 'Pedro Sánchez',
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b9e02935-1763292436908.png",
    userAlt: 'Hombre con barba y camisa negra en fondo neutro',
    requestedPermission: { resource: 'documents', action: 'delete' },
    reason: 'Necesito eliminar archivos obsoletos del sistema',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: 'pending'
  }];


  const handleEditUser = (userId: string) => {
    console.log('Editar usuario:', userId);
  };

  const handleViewPermissions = (userId: string) => {
    navigate('/permission-management', { state: { userId } });
  };

  const handleApproveRequest = (requestId: string) => {
    console.log('Aprobar solicitud:', requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    console.log('Rechazar solicitud:', requestId);
  };

  const handleAddUser = () => {
    console.log('Agregar nuevo usuario');
  };

  const handleBulkPermissions = () => {
    navigate('/permission-management');
  };

  const handleGenerateReport = () => {
    console.log('Generar reporte del sistema');
  };

  const tabs = [
  { id: 'users' as TabType, label: 'Gestión de Usuarios', icon: 'Users' },
  { id: 'permissions' as TabType, label: 'Vista de Permisos', icon: 'Shield' },
  { id: 'activity' as TabType, label: 'Actividad del Sistema', icon: 'Activity' }];


  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} />


      <main
        className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`
        }>

        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <div className="mb-6">
            <NavigationBreadcrumb customItems={[]} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
                Panel de Control
              </h1>
              <p className="text-muted-foreground">
                Gestión completa del sistema FileGuard
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReport}
                iconName="FileText"
                iconSize={16}>

                Generar Reporte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPermissions}
                iconName="Shield"
                iconSize={16}>

                Permisos Masivos
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddUser}
                iconName="UserPlus"
                iconSize={16}>

                Agregar Usuario
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) =>
            <MetricsCard key={metric.id} metric={metric} />
            )}
          </div>

          {permissionRequests.filter((req) => req.status === 'pending').length > 0 &&
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Solicitudes de Permisos Pendientes
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Hay {permissionRequests.filter((req) => req.status === 'pending').length}{' '}
                    solicitudes que requieren tu atención
                  </p>
                  <PendingRequests
                  requests={permissionRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest} />

                </div>
              </div>
            </div>
          }

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) =>
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-smooth whitespace-nowrap ${
                  activeTab === tab.id ?
                  'text-primary border-b-2 border-primary bg-primary/5' :
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`
                  }>

                    <Icon name={tab.icon} size={18} />
                    <span>{tab.label}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'users' &&
              <UserManagementTable
                users={users}
                onEditUser={handleEditUser}
                onViewPermissions={handleViewPermissions} />

              }
              {activeTab === 'permissions' &&
              <PermissionOverview
                roleDistribution={roleDistribution}
                accessLevels={accessLevels} />

              }
              {activeTab === 'activity' && <SystemActivity activities={activities} />}
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default AdminDashboard;