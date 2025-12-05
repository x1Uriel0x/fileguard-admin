import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import type { PermissionHistory } from '../types';

interface ActivityLogProps {
  history: PermissionHistory[];
}

const ActivityLog = ({ history }: ActivityLogProps) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'granted':
        return 'text-success';
      case 'revoked':
        return 'text-error';
      case 'modified':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'granted':
        return 'CheckCircle';
      case 'revoked':
        return 'XCircle';
      case 'modified':
        return 'Edit';
      default:
        return 'Activity';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'granted':
        return 'Concedido';
      case 'revoked':
        return 'Revocado';
      case 'modified':
        return 'Modificado';
      default:
        return action;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="History" size={20} className="text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Historial de Actividad
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-background border border-border rounded-lg hover:bg-muted transition-smooth"
            >
              <div className="flex items-start gap-3">
                <Icon
                  name={getActionIcon(entry.action)}
                  size={20}
                  className={getActionColor(entry.action)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-medium ${getActionColor(
                        entry.action
                      )}`}
                    >
                      {getActionLabel(entry.action)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.accessLevel}
                    </span>
                  </div>

                  <p className="text-sm text-foreground mb-1">
                    <span className="font-medium">{entry.userName}</span> en{' '}
                    <span className="font-medium">{entry.categoryName}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Image
                      src={`https://randomuser.me/api/portraits/men/${Math.floor(
                        Math.random() * 50
                      )}.jpg`}
                      alt={`Foto de perfil del administrador ${entry.modifiedByName}`}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>Por {entry.modifiedByName}</span>
                    <span>•</span>
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;