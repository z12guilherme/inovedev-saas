import { useState } from 'react';
import { Download, FileSpreadsheet, TrendingUp, Calendar, Filter, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function ReportsPage() {
  const { store } = useAdmin();
  const { session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const now = new Date();
    
    switch (value) {
      case '7':
        setStartDate(format(subDays(now, 7), 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
      case '30':
        setStartDate(format(subDays(now, 30), 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
      case '90':
        setStartDate(format(subDays(now, 90), 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
    }
  };

  const handleExport = async (type: 'orders' | 'products' | 'sales_report') => {
    if (!store || !session?.access_token) return;

    setLoading(type);
    try {
      const params = new URLSearchParams({
        store_id: store.id,
        type,
        start_date: startDate,
        end_date: endDate
      });

      const response = await supabase.functions.invoke('export-data', {
        body: null,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      // For now, do a direct fetch since we need the raw CSV
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-data?${params}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Export failed');
      }

      // Download the CSV
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success('Exportação concluída!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Exporte dados e analise a performance da sua loja</p>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Período rápido</Label>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="last_month">Mês passado</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateRange('custom');
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Data final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateRange('custom');
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Pedidos
              </CardTitle>
              <CardDescription>
                Exportar lista completa de pedidos com detalhes de cliente e pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Número do pedido</li>
                <li>• Dados do cliente</li>
                <li>• Status e pagamento</li>
                <li>• Valores e data</li>
              </ul>
              <Button 
                onClick={() => handleExport('orders')} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'orders' ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Produtos
              </CardTitle>
              <CardDescription>
                Exportar catálogo de produtos com preços e estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Nome e descrição</li>
                <li>• Preço atual e anterior</li>
                <li>• Estoque disponível</li>
                <li>• Status (ativo/destaque)</li>
              </ul>
              <Button 
                onClick={() => handleExport('products')} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'products' ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Relatório de Vendas
              </CardTitle>
              <CardDescription>
                Resumo de vendas agrupado por dia com totais e formas de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                <li>• Vendas por dia</li>
                <li>• Quantidade de pedidos</li>
                <li>• Total de receita</li>
                <li>• Pagamentos por tipo</li>
              </ul>
              <Button 
                onClick={() => handleExport('sales_report')} 
                disabled={loading !== null}
                className="w-full"
              >
                {loading === 'sales_report' ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">💡 Dicas de uso</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Os arquivos CSV podem ser abertos no Excel ou Google Sheets</li>
              <li>• Use o filtro de data para exportar períodos específicos</li>
              <li>• O relatório de vendas é ideal para análise de performance mensal</li>
              <li>• O separador de colunas é ponto e vírgula (;) para compatibilidade com Excel BR</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
