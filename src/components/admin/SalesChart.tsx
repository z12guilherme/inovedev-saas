import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

interface SalesChartProps {
  orders: Order[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export function SalesChart({ orders }: SalesChartProps) {
  const { chartData, trend, totalWeek, totalLastWeek } = useMemo(() => {
    const last7Days: { date: string; total: number; orders: number; label: string }[] = [];
    let totalWeek = 0;
    let totalLastWeek = 0;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      const dayOrders = orders.filter(o => 
        o.created_at.startsWith(dateStr)
      );
      
      const total = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
      totalWeek += total;
      
      last7Days.push({
        date: dateStr,
        total,
        orders: dayOrders.length,
        label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3)
      });
    }

    // Calculate last week for comparison
    for (let i = 13; i >= 7; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => 
        o.created_at.startsWith(dateStr)
      );
      
      totalLastWeek += dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    }

    const trend = totalLastWeek > 0 
      ? ((totalWeek - totalLastWeek) / totalLastWeek) * 100 
      : totalWeek > 0 ? 100 : 0;
    
    return { chartData: last7Days, trend, totalWeek, totalLastWeek };
  }, [orders]);

  const hasData = chartData.some(d => d.total > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Vendas - Últimos 7 dias</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{formatCurrency(totalWeek)}</span>
              {trend !== 0 && (
                <span className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(trend).toFixed(0)}%
                </span>
              )}
              {trend === 0 && totalLastWeek > 0 && (
                <span className="flex items-center text-sm text-muted-foreground">
                  <Minus className="h-4 w-4 mr-1" />
                  0%
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="label" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                className="fill-muted-foreground"
                width={60}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'total') return [formatCurrency(value), 'Vendas'];
                  return [value, 'Pedidos'];
                }}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">Nenhuma venda nos últimos 7 dias</p>
              <p className="text-sm">Compartilhe sua loja para começar a vender!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Payment Methods Chart
export function PaymentMethodsChart({ orders }: SalesChartProps) {
  const data = useMemo(() => {
    const methods: Record<string, number> = {};
    
    orders.forEach(order => {
      const method = order.payment_method || 'outros';
      methods[method] = (methods[method] || 0) + Number(order.total);
    });

    const labels: Record<string, string> = {
      pix: 'Pix',
      card: 'Cartão',
      cash: 'Dinheiro',
      mercadopago: 'Mercado Pago',
      outros: 'Outros'
    };

    return Object.entries(methods).map(([key, value]) => ({
      name: labels[key] || key,
      value: value
    }));
  }, [orders]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pagamentos por Método</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Orders by Status Chart
export function OrdersStatusChart({ orders }: SalesChartProps) {
  const data = useMemo(() => {
    const statuses: Record<string, number> = {};
    
    orders.forEach(order => {
      statuses[order.status] = (statuses[order.status] || 0) + 1;
    });

    const labels: Record<string, string> = {
      pending: 'Pendentes',
      confirmed: 'Confirmados',
      preparing: 'Preparando',
      shipped: 'Enviados',
      delivered: 'Entregues',
      cancelled: 'Cancelados'
    };

    return Object.entries(statuses).map(([key, value]) => ({
      name: labels[key] || key,
      value: value
    }));
  }, [orders]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status dos Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
