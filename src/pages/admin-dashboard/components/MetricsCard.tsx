import Icon from '../../../components/AppIcon';
import type { MetricCard } from '../types';

interface MetricsCardProps {
  metric: MetricCard;
}

const MetricsCard = ({ metric }: MetricsCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-smooth hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${metric.color}20` }}
        >
          <Icon name={metric.icon} size={24} color={metric.color} />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            metric.changeType === 'increase' ?'bg-success/10 text-success' :'bg-error/10 text-error'
          }`}
        >
          <Icon
            name={metric.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'}
            size={14}
          />
          <span>{Math.abs(metric.change)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{metric.title}</p>
        <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
        <p className="text-xs text-muted-foreground">{metric.description}</p>
      </div>
    </div>
  );
};

export default MetricsCard;