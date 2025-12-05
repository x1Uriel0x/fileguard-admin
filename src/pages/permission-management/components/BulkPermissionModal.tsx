import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import type { User, FileCategory, AccessLevel } from '../types';

interface BulkPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  categories: FileCategory[];
  onApply: (userIds: string[], categoryId: string, access: AccessLevel) => void;
}

const BulkPermissionModal = ({
  isOpen,
  onClose,
  users,
  categories,
  onApply,
}: BulkPermissionModalProps) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [access, setAccess] = useState<AccessLevel>({
    view: false,
    edit: false,
    upload: false,
    delete: false,
  });

  if (!isOpen) return null;

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleApply = () => {
    if (selectedUsers.size > 0 && selectedCategory) {
      onApply(Array.from(selectedUsers), selectedCategory, access);
      onClose();
      setSelectedUsers(new Set());
      setSelectedCategory('');
      setAccess({ view: false, edit: false, upload: false, delete: false });
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    description: cat.description,
  }));

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/50 z-400"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-500 p-4">
        <div className="bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Actualización Masiva de Permisos
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                iconName="X"
                iconSize={20}
              />
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Seleccionar Usuarios ({selectedUsers.size} seleccionados)
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedUsers.size === users.length
                      ? 'Deseleccionar Todos'
                      : 'Seleccionar Todos'}
                  </Button>
                </div>
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border-b border-border last:border-b-0 hover:bg-muted transition-smooth"
                    >
                      <Checkbox
                        label={`${user.name} (${user.email})`}
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Select
                  label="Categoría de Archivo"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Seleccionar categoría"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Niveles de Acceso
                </label>
                <div className="space-y-3 p-4 bg-background border border-border rounded-lg">
                  <Checkbox
                    label="Ver archivos"
                    description="Permite ver y descargar archivos"
                    checked={access.view}
                    onChange={(e) =>
                      setAccess({ ...access, view: e.target.checked })
                    }
                  />
                  <Checkbox
                    label="Editar archivos"
                    description="Permite modificar archivos existentes"
                    checked={access.edit}
                    onChange={(e) =>
                      setAccess({ ...access, edit: e.target.checked })
                    }
                  />
                  <Checkbox
                    label="Subir archivos"
                    description="Permite cargar nuevos archivos"
                    checked={access.upload}
                    onChange={(e) =>
                      setAccess({ ...access, upload: e.target.checked })
                    }
                  />
                  <Checkbox
                    label="Eliminar archivos"
                    description="Permite eliminar archivos permanentemente"
                    checked={access.delete}
                    onChange={(e) =>
                      setAccess({ ...access, delete: e.target.checked })
                    }
                  />
                </div>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium mb-1">Advertencia</p>
                    <p className="text-muted-foreground">
                      Esta acción actualizará los permisos para{' '}
                      {selectedUsers.size} usuario(s). Los cambios se aplicarán
                      inmediatamente y pueden afectar el acceso a archivos
                      existentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleApply}
              disabled={selectedUsers.size === 0 || !selectedCategory}
              iconName="Check"
              iconPosition="left"
            >
              Aplicar Cambios
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkPermissionModal;