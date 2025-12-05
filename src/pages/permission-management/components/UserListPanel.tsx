import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import type { User } from '../types';

interface UserListPanelProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
}

const UserListPanel = ({ users, selectedUser, onUserSelect }: UserListPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary';
      case 'user':
        return 'bg-accent/10 text-accent';
      case 'guest':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'full':
        return 'text-success';
      case 'limited':
        return 'text-warning';
      case 'restricted':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      case 'guest':
        return 'Invitado';
      default:
        return role;
    }
  };

  const getPermissionLevelLabel = (level: string) => {
    switch (level) {
      case 'full':
        return 'Completo';
      case 'limited':
        return 'Limitado';
      case 'restricted':
        return 'Restringido';
      default:
        return level;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} de {users.length}
          </span>
        </div>

        <Input
          type="search"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Filtrar por rol"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrar por estado"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No se encontraron usuarios
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`
                  w-full p-3 rounded-lg text-left transition-smooth
                  ${
                    selectedUser?.id === user.id
                      ? 'bg-primary/10 border-2 border-primary' :'bg-background hover:bg-muted border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={user.avatar}
                      alt={`Foto de perfil de ${user.name}, ${user.role} del departamento de ${user.department}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {user.email}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {user.department}
                      </span>
                      <span
                        className={`text-xs font-medium ${getPermissionLevelColor(
                          user.permissionLevel
                        )}`}
                      >
                        {getPermissionLevelLabel(user.permissionLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPanel;