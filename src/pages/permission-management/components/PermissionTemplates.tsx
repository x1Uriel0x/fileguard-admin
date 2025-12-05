import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import type { PermissionTemplate } from '../types';

interface PermissionTemplatesProps {
  templates: PermissionTemplate[];
  onApplyTemplate: (templateId: string) => void;
  onSaveAsTemplate: () => void;
}

const PermissionTemplates = ({
  templates,
  onApplyTemplate,
  onSaveAsTemplate,
}: PermissionTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'user':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'guest':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Plantillas de Permisos
        </h3>
        <Button
          variant="outline"
          size="sm"
          iconName="Save"
          iconPosition="left"
          onClick={onSaveAsTemplate}
        >
          Guardar como Plantilla
        </Button>
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`
              p-4 border-2 rounded-lg cursor-pointer transition-smooth
              ${
                selectedTemplate === template.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
              }
            `}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {template.name}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(
                      template.role
                    )}`}
                  >
                    {getRoleLabel(template.role)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </div>
              {selectedTemplate === template.id && (
                <Icon name="Check" size={20} className="text-primary" />
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Icon name="FileText" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {template.permissions.length} categorías configuradas
              </span>
            </div>

            {selectedTemplate === template.id && (
              <Button
                variant="default"
                size="sm"
                className="w-full mt-3"
                iconName="Check"
                iconPosition="left"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyTemplate(template.id);
                }}
              >
                Aplicar Plantilla
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Las plantillas proporcionan configuraciones predefinidas de permisos
            basadas en roles. Puede personalizar los permisos después de aplicar
            una plantilla.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionTemplates;