import React from "react";
import type { PermissionTemplate, Permission } from "../types";

interface PermissionTemplatesProps {
  templates: PermissionTemplate[];
  onApplyTemplate: (templateId: string) => void;

  // YA ACEPTA PARÁMETROS ✔
  onSaveAsTemplate: (name: string, permissions: Permission[]) => void;
}

const PermissionTemplates: React.FC<PermissionTemplatesProps> = ({
  templates,
  onApplyTemplate,
  onSaveAsTemplate
}) => {

  const handleSaveClick = () => {
    const name = prompt("Nombre de la plantilla:");
    if (!name) return;

    // En este punto no tenemos permisos reales todavía,
    // así que mandamos un arreglo vacío (o puedes pasar permissions actuales).
    onSaveAsTemplate(name, []);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold">Plantillas</h3>

      <div className="space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            className="w-full text-left p-3 rounded-md hover:bg-muted transition"
            onClick={() => onApplyTemplate(template.id)}
          >
            <p className="font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </button>
        ))}
      </div>

      <button
        className="w-full bg-primary text-primary-foreground py-2 rounded-md mt-2"
        onClick={handleSaveClick}
      >
        Guardar como nueva plantilla
      </button>
    </div>
  );
};

export default PermissionTemplates;
  