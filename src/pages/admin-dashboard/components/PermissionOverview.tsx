import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';
import type { ChartData } from '../types';

interface PermissionOverviewProps {
  roleDistribution: ChartData[];
  accessLevels: ChartData[];
}

const PermissionOverview = ({ roleDistribution, accessLevels }: PermissionOverviewProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-md shadow-lg px-3 py-2">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value} usuarios ({((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const totalUsers = roleDistribution.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = roleDistribution.map(item => ({ ...item, total: totalUsers }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="Users" size={20} color="var(--color-primary)" />
            <h3 className="text-lg font-semibold text-foreground">Distribución de Roles</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithTotal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataWithTotal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {roleDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="Shield" size={20} color="var(--color-accent)" />
            <h3 className="text-lg font-semibold text-foreground">Niveles de Acceso</h3>
          </div>

          <div className="space-y-4">
            {accessLevels.map((level) => {
              const percentage = (level.value / totalUsers) * 100;
              return (
                <div key={level.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{level.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {level.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-smooth"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Información de Permisos</p>
                <p className="text-xs text-muted-foreground">
                  Los niveles de acceso determinan qué operaciones pueden realizar los usuarios sobre los archivos del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">156</p>
              <p className="text-xs text-muted-foreground">Permisos Activos</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon name="Clock" size={20} color="var(--color-warning)" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Solicitudes Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
              <Icon name="XCircle" size={20} color="var(--color-error)" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">8</p>
              <p className="text-xs text-muted-foreground">Permisos Revocados</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">+24%</p>
              <p className="text-xs text-muted-foreground">Cambio Mensual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionOverview;