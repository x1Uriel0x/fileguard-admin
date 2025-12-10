import React from "react";
import type { LogItem } from "../../../src/pages/admin-dashboard/types";
import Icon from "../../components/AppIcon";

interface SystemActivityProps {
  logs: LogItem[];
}

const SystemActivity: React.FC<SystemActivityProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Actividad del Sistema</h3>
        <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Actividad del Sistema</h3>
        <span className="text-sm text-muted-foreground">{logs.length} eventos</span>
      </div>

      <ul className="space-y-3">
        {logs.map((l) => (
          <li key={l.id} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
              <Icon name={l.tipo === "upload" ? "Upload" : l.tipo === "download" ? "Download" : "Activity"} size={16} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1)} — {l.file_name}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div>
              </div>

              <p className="text-xs text-muted-foreground mt-1">{l.details ? JSON.stringify(l.details) : ""}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemActivity;
