import { AlertTriangle, Clock, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Alert {
  type: 'warning' | 'info' | 'danger';
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  count?: number;
}

interface DashboardAlertsProps {
  lowStockCount: number;
  pendingOrdersCount: number;
}

export function DashboardAlerts({ lowStockCount, pendingOrdersCount }: DashboardAlertsProps) {
  const alerts: Alert[] = [];

  if (pendingOrdersCount > 0) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      title: `${pendingOrdersCount} pedido${pendingOrdersCount > 1 ? 's' : ''} pendente${pendingOrdersCount > 1 ? 's' : ''}`,
      description: 'Aguardando confirmação',
      count: pendingOrdersCount
    });
  }

  if (lowStockCount > 0) {
    alerts.push({
      type: 'danger',
      icon: Package,
      title: `${lowStockCount} produto${lowStockCount > 1 ? 's' : ''} com estoque baixo`,
      description: 'Menos de 5 unidades',
      count: lowStockCount
    });
  }

  if (alerts.length === 0) return null;

  const typeStyles = {
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary',
    danger: 'bg-destructive/10 border-destructive/20 text-destructive'
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <Card key={index} className={`border ${typeStyles[alert.type]}`}>
          <CardContent className="flex items-center gap-3 p-4">
            <alert.icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs opacity-80">{alert.description}</p>
            </div>
            {alert.count && (
              <Badge variant="secondary" className="text-xs">
                {alert.count}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}