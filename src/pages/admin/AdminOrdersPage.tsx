import { useEffect, useState } from 'react';
import { Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_neighborhood: string;
  customer_city: string;
  customer_complement: string | null;
  customer_reference: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-primary/10 text-primary border-primary/20',
  preparing: 'bg-primary/10 text-primary border-primary/20',
  shipped: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
};

const paymentLabels: Record<string, string> = {
  pix: 'Pix',
  card: 'Cartão',
  cash: 'Dinheiro'
};

export default function AdminOrdersPage() {
  const { store } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const fetchOrders = async () => {
    if (!store) return;
    
    let query = supabase
      .from('orders')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [store, statusFilter]);

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    setOrderItems(data || []);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <p className="text-muted-foreground">Gerencie os pedidos da sua loja</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="shipped">Enviados</SelectItem>
              <SelectItem value="delivered">Entregues</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">#{order.order_number}</span>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(Number(order.total))}</p>
                        <p className="text-sm text-muted-foreground">{paymentLabels[order.payment_method]}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {statusFilter === 'all'
                  ? 'Nenhum pedido ainda. Compartilhe sua loja para começar a vender!'
                  : 'Nenhum pedido com este status.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-medium mb-2">Cliente</h4>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.customer_phone}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium mb-2">Endereço de Entrega</h4>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p>{selectedOrder.customer_address}</p>
                  <p>{selectedOrder.customer_neighborhood} - {selectedOrder.customer_city}</p>
                  {selectedOrder.customer_complement && (
                    <p>Complemento: {selectedOrder.customer_complement}</p>
                  )}
                  {selectedOrder.customer_reference && (
                    <p>Referência: {selectedOrder.customer_reference}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Itens</h4>
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between text-sm">
                      <div>
                        <p>{item.quantity}x {item.product_name}</p>
                        <p className="text-muted-foreground">{formatCurrency(Number(item.unit_price))} cada</p>
                      </div>
                      <p className="font-medium">{formatCurrency(Number(item.total_price))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>{formatCurrency(Number(selectedOrder.delivery_fee))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(Number(selectedOrder.total))}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">
                  <strong>Pagamento:</strong> {paymentLabels[selectedOrder.payment_method]}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
