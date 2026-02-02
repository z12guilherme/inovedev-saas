import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowRight, Share2, ExternalLink, Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardAlerts } from '@/components/admin/DashboardAlerts';
import { SalesChart, PaymentMethodsChart, OrdersStatusChart } from '@/components/admin/SalesChart';
import { useAdmin } from '@/contexts/AdminContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  todayOrders: number;
  todayRevenue: number;
}

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { store, loading: storeLoading } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable realtime notifications
  useRealtimeNotifications({ storeId: store?.id || '' });

  useEffect(() => {
    if (!store) return;

    const fetchStats = async () => {
      try {
        // Fetch products with low stock
        const { data: products, count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('store_id', store.id);

        const lowStockCount = products?.filter(p => p.stock <= 5 && p.stock > 0).length || 0;

        // Fetch orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders?.filter(o => o.created_at.startsWith(today)) || [];
        
        const totalOrders = orders?.length || 0;
        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
        const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
        const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

        setStats({
          totalProducts: productsCount || 0,
          totalOrders,
          pendingOrders,
          totalRevenue,
          lowStockCount,
          todayOrders: todayOrders.length,
          todayRevenue
        });

        setAllOrders(orders || []);
        setRecentOrders((orders || []).slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [store]);

  const handleShareLink = () => {
    const storeUrl = `${window.location.origin}/loja/${store?.slug}`;
    navigator.clipboard.writeText(storeUrl);
    toast.success('Link copiado!');
  };

  if (storeLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-primary/10 text-primary',
    preparing: 'bg-primary/10 text-primary',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Olá! 👋</h1>
            <p className="text-muted-foreground">Aqui está o resumo da sua loja</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/criar-loja">
                <Plus className="h-4 w-4 mr-2" />
                Criar Loja
              </Link>
            </Button>
            <Button variant="outline" onClick={handleShareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button asChild>
              <a href={`/loja/${store?.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver loja
              </a>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <DashboardAlerts 
          lowStockCount={stats.lowStockCount} 
          pendingOrdersCount={stats.pendingOrders} 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(stats.todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">{stats.todayOrders} pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Vendas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">{stats.totalOrders} pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrders > 0
                  ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                  : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">por pedido</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart orders={allOrders} />
          <PaymentMethodsChart orders={allOrders} />
        </div>

        {/* Orders Status */}
        {allOrders.length > 0 && (
          <OrdersStatusChart orders={allOrders} />
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/pedidos">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">Pedido #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(Number(order.total))}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground mb-4">
                  Nenhum pedido ainda
                </p>
                <Button variant="outline" onClick={handleShareLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar loja
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
