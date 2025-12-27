import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import type { FileCategory, Permission, AccessLevel } from '../types';

interface PermissionMatrixProps {
  categories: FileCategory[];
  permissions: Permission[];
  userId: string;
  onPermissionChange: (categoryId: string, access: AccessLevel) => void;
  onResetToRole: () => void;
}

const PermissionMatrix = ({
  categories,
  permissions,
  userId,
  onPermissionChange,
  onResetToRole,
}: PermissionMatrixProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getPermissionForCategory = (categoryId: string): Permission | undefined => {
    return permissions.find(
      (p) => p.categoryId === categoryId && p.userId === userId
    );
  };

  const handleAccessChange = (
    categoryId: string,
    accessType: keyof AccessLevel,
    value: boolean
  ) => {
    const currentPermission = getPermissionForCategory(categoryId);
    const newAccess: AccessLevel = currentPermission
      ? { ...currentPermission.access, [accessType]: value }
      : { view: false, edit: false, upload: false, delete: false, [accessType]: value };

    onPermissionChange(categoryId, newAccess);
  };

  const hasCustomPermissions = permissions.some((p) => p.customized && p.userId === userId);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Matriz de Permisos
          </h2>
          {hasCustomPermissions && (
            <Button
              variant="outline"
              size="sm"
              iconName="RotateCcw"
              iconPosition="left"
              onClick={onResetToRole}
            >
              Restablecer a Rol Predeterminado
            </Button>
          )}
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Buscar carpetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground">
          <div>Categoría</div>
          <div className="text-center">Ver</div>
          <div className="text-center">Editar</div>
          <div className="text-center">Subir</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredCategories.map((category) => {
            const permission = getPermissionForCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const access = permission?.access || {
              view: false,
              edit: false,
              upload: false,
              delete: false,
            };

            return (
              <div
                key={category.id}
                className="border border-border rounded-lg overflow-hidden bg-card"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <Icon name={category.icon} size={20} className="text-primary" />
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-foreground">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.fileCount} archivos
                      </p>
                    </div>
                    {permission?.inherited && (
                      <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                        Heredado
                      </span>
                    )}
                    {permission?.customized && (
                      <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                        Personalizado
                      </span>
                    )}
                  </div>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className={`text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-border bg-background">
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-sm font-medium text-foreground">
                        Nivel de Acceso
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={access.view}
                          onChange={(e) =>
                            handleAccessChange(
                              category.id,
                              'view',
                              e.target.checked
                            )
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={access.edit}
                          onChange={(e) =>
                            handleAccessChange(
                              category.id,
                              'edit',
                              e.target.checked
                            )
                          }
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={access.upload}
                          onChange={(e) =>
                            handleAccessChange(
                              category.id,
                              'upload',
                              e.target.checked
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <Icon
                          name="Info"
                          size={16}
                          className="text-primary mt-0.5"
                        />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">
                            Permisos Efectivos:
                          </p>
                          <ul className="space-y-1">
                            {access.view && <li>• Puede ver archivos</li>}
                            {access.edit && <li>• Puede editar archivos</li>}
                            {access.upload && <li>• Puede subir archivos</li>}
                            {access.delete && <li>• Puede eliminar archivos</li>}
                            {!access.view &&
                              !access.edit &&
                              !access.upload &&
                              !access.delete && <li>• Sin acceso</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;