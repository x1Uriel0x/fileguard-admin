import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Select from '../../../components/ui/Select';
import type { FileOperation, ActivityFilter } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SystemActivityProps {
  activities: FileOperation[];
}

const SystemActivity = ({ activities }: SystemActivityProps) => {
  const [filters, setFilters] = useState<ActivityFilter>({
    dateRange: 'all',
    operationType: 'all',
    userId: 'all',
    status: 'all',
  });

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'all', label: 'Todo el Tiempo' },
  ];

  const operationTypeOptions = [
    { value: 'all', label: 'Todas las Operaciones' },
    { value: 'upload', label: 'Subidas' },
    { value: 'view', label: 'Visualizaciones' },
    { value: 'edit', label: 'Ediciones' },
    { value: 'delete', label: 'Eliminaciones' },
    { value: 'share', label: 'Compartidos' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'success', label: 'Exitoso' },
    { value: 'failed', label: 'Fallido' },
    { value: 'pending', label: 'Pendiente' },
  ];

  const getOperationIcon = (operation: FileOperation['operation']) => {
    switch (operation) {
      case 'upload':
        return 'Upload';
      case 'view':
        return 'Eye';
      case 'edit':
        return 'Edit';
      case 'delete':
        return 'Trash2';
      case 'share':
        return 'Share2';
    }
  };

  const getOperationLabel = (operation: FileOperation['operation']) => {
    switch (operation) {
      case 'upload':
        return 'Subió';
      case 'view':
        return 'Visualizó';
      case 'edit':
        return 'Editó';
      case 'delete':
        return 'Eliminó';
      case 'share':
        return 'Compartió';
    }
  };

  const getOperationColor = (operation: FileOperation['operation']) => {
    switch (operation) {
      case 'upload':
        return 'var(--color-success)';
      case 'view':
        return 'var(--color-primary)';
      case 'edit':
        return 'var(--color-warning)';
      case 'delete':
        return 'var(--color-error)';
      case 'share':
        return 'var(--color-accent)';
    }
  };

  const getStatusBadge = (status: FileOperation['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success">
            <Icon name="CheckCircle" size={12} />
            Exitoso
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-error/10 text-error">
            <Icon name="XCircle" size={12} />
            Fallido
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-warning/10 text-warning">
            <Icon name="Clock" size={12} />
            Pendiente
          </span>
        );
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesOperation =
      filters.operationType === 'all' || activity.operation === filters.operationType;
    const matchesStatus = filters.status === 'all' || activity.status === filters.status;

    const now = new Date();
    let matchesDate = true;
    if (filters.dateRange === 'today') {
      matchesDate = activity.timestamp.toDateString() === now.toDateString();
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = activity.timestamp >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = activity.timestamp >= monthAgo;
    }

    return matchesOperation && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={dateRangeOptions}
          value={filters.dateRange}
          onChange={(value) => setFilters({ ...filters, dateRange: value as ActivityFilter['dateRange'] })}
          className="w-full sm:w-48"
        />
        <Select
          options={operationTypeOptions}
          value={filters.operationType}
          onChange={(value) =>
            setFilters({ ...filters, operationType: value as ActivityFilter['operationType'] })
          }
          className="w-full sm:w-48"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value as ActivityFilter['status'] })}
          className="w-full sm:w-48"
        />
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-smooth"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${getOperationColor(activity.operation)}20` }}
              >
                <Icon
                  name={getOperationIcon(activity.operation)}
                  size={20}
                  color={getOperationColor(activity.operation)}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={activity.userAvatar}
                        alt={activity.userAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(activity.timestamp, "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>

                <p className="text-sm text-foreground mb-1">
                  {getOperationLabel(activity.operation)}{' '}
                  <span className="font-medium">{activity.fileName}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron actividades</p>
        </div>
      )}
    </div>
  );
};

export default SystemActivity;