import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  total: number;
  created_at: string;
}

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const chartData = useMemo(() => {
    const last7Days: { date: string; total: number; label: string }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      
      const dayOrders = orders.filter(o => 
        o.created_at.startsWith(dateStr)
      );
      
      const total = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
      
      last7Days.push({
        date: dateStr,
        total,
        label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3)
      });
    }
    
    return last7Days;
  }, [orders]);

  const hasData = chartData.some(d => d.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vendas dos últimos 7 dias</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
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
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Nenhuma venda nos últimos 7 dias
          </div>
        )}
      </CardContent>
    </Card>
  );
}