import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import type { User, SortField, SortOrder } from '../types/';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../../lib/supabase';

interface UserManagementTableProps {
  users: User[];
  onEditUser: (id: string) => void;
  onViewPermissions: (id: string) => void;
  onBanToggle: (id: string, banned: boolean) => void;
  onRefreshUsers: () => void;
  loading?: boolean;  // ⬅ AÑADIMOS ESTA LÍNEA
}


const UserManagementTable = ({
  users,
  onEditUser,
  onViewPermissions,
  onBanToggle,
  onRefreshUsers,
  loading,
}: UserManagementTableProps) => {

   if (loading) {
    return (
      <p className="text-center p-6 text-muted-foreground">
        Cargando usuarios...
      </p>
    );
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const roleOptions = [
    { value: 'all', label: 'Todos los Roles' },
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'guest', label: 'Invitado' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'suspended', label: 'Suspendido' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'lastActivity':
          comparison = a.lastActivity.getTime() - b.lastActivity.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'suspended':
        return 'bg-error/10 text-error';
    }
  };

  const getStatusLabel = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'suspended':
        return 'Suspendido';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      case 'guest':
        return 'Invitado';
    }
  };

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      banned: !isBanned,
      status: !isBanned ? "suspended" : "active",
    })
    .eq("id", userId);

  if (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return;
  }

  onRefreshUsers(); // refresca la tabla
};




  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Filtrar por rol"
            className="w-full sm:w-48"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrar por estado"
            className="w-full sm:w-48"
          />
        </div>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Usuario
                  <Icon
                    name={sortField === 'name' && sortOrder === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    className={sortField === 'name' ? 'opacity-100' : 'opacity-30'}
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Rol
                  <Icon
                    name={sortField === 'role' && sortOrder === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={16}
                    className={sortField === 'role' ? 'opacity-100' : 'opacity-30'}
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('lastActivity')}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Última Actividad
                  <Icon
                    name={
                      sortField === 'lastActivity' && sortOrder === 'desc' ?'ChevronDown' :'ChevronUp'
                    }
                    size={16}
                    className={sortField === 'lastActivity' ? 'opacity-100' : 'opacity-30'}
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Estado
                  <Icon
                    name={
                      sortField === 'status' && sortOrder === 'desc' ? 'ChevronDown' : 'ChevronUp'
                    }
                    size={16}
                    className={sortField === 'status' ? 'opacity-100' : 'opacity-30'}
                  />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Archivos</span>
              </th>
              <th className="text-right py-3 px-4">
                <span className="text-sm font-medium text-muted-foreground">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={user.avatar}
                        alt={user.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">{getRoleLabel(user.role)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">
                    {format(user.lastActivity, "dd MMM yyyy, HH:mm", { locale: es })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">{user.filesAccessed}</span>
                </td>
               <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">

                  {/* Ver permisos actuales */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewPermissions(user.id)}
                    iconName="Shield"
                    iconSize={16}
                  >
                    Permisos
                  </Button>

                  {/* Suspender / Reactivar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBanUser(user.id, !!user.banned)}
                    iconName={user.banned ? "UserCheck" : "UserX"}
                    iconSize={16}
                >
                  {user.banned ? "Reactivar" : "Suspender"}
                </Button>


                </div>
              </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-3">
        {filteredAndSortedUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={user.avatar}
                    alt={user.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                  user.status
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {getStatusLabel(user.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Rol</p>
                <p className="text-foreground">{getRoleLabel(user.role)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Archivos</p>
                <p className="text-foreground">{user.filesAccessed}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs mb-1">Última Actividad</p>
                <p className="text-foreground">
                  {format(user.lastActivity, "dd MMM yyyy, HH:mm", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => onViewPermissions(user.id)}
                iconName="Shield"
              >
                Permisos
              </Button>

              <Button
                variant={user.banned ? "destructive" : "outline"}
                size="sm"
                fullWidth
                onClick={() => toggleBanUser(user.id, !!user.banned)}
                iconName={user.banned ? "UserCheck" : "UserX"}
              >
                {user.banned ? "Reactivar" : "Suspender"}
              </Button>

            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;