import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import type { PermissionRequest, PermissionAction } from "../types";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendingRequestsProps {
  requests: PermissionRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const PendingRequests = ({ requests, onApprove, onReject }: PendingRequestsProps) => {
 
const getPermissionLabel = (permission: PermissionRequest['requestedPermission']) => {
  const actionLabels: Record<PermissionAction, string> = {
    read: 'Lectura',
    write: 'Escritura',
    delete: 'Eliminación',
    admin: 'Administración',
  };

  return `${actionLabels[permission.action]} - ${permission.resource}`;
};


  const pendingRequests = requests.filter((req) => req.status === 'pending');

  return (
    <div className="space-y-3">
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="CheckCircle" size={48} className="mx-auto text-success mb-4" />
          <p className="text-foreground font-medium mb-1">No hay solicitudes pendientes</p>
          <p className="text-sm text-muted-foreground">
            Todas las solicitudes de permisos han sido procesadas
          </p>
        </div>
      ) : (
        pendingRequests.map((request) => (
          <div
            key={request.id}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-smooth"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={request.userAvatar}
                  alt={request.userAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{request.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(request.timestamp, "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning">
                    <Icon name="Clock" size={12} />
                    Pendiente
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-foreground mb-1">
                    Solicita permiso de:{' '}
                    <span className="font-medium">{getPermissionLabel(request.requestedPermission)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Razón:</span> {request.reason}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onApprove(request.id)}
                    iconName="CheckCircle"
                    iconSize={16}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(request.id)}
                    iconName="XCircle"
                    iconSize={16}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PendingRequests;