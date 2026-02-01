import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user and get their store
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const storeId = url.searchParams.get('store_id');
    const type = url.searchParams.get('type') || 'orders';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    if (!storeId) {
      return new Response(
        JSON.stringify({ error: 'store_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to the store
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (!store) {
      return new Response(
        JSON.stringify({ error: 'Store not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let csvData = '';

    if (type === 'orders') {
      let query = supabase
        .from('orders')
        .select(`
          order_number,
          customer_name,
          customer_phone,
          customer_address,
          customer_neighborhood,
          customer_city,
          status,
          payment_method,
          payment_status,
          subtotal,
          delivery_fee,
          total,
          created_at
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Build CSV
      const headers = [
        'Pedido', 'Cliente', 'Telefone', 'Endereço', 'Bairro', 'Cidade',
        'Status', 'Pagamento', 'Status Pagamento', 'Subtotal', 'Entrega', 'Total', 'Data'
      ];
      
      csvData = headers.join(';') + '\n';
      
      orders?.forEach(order => {
        const row = [
          order.order_number,
          order.customer_name,
          order.customer_phone,
          order.customer_address,
          order.customer_neighborhood,
          order.customer_city,
          order.status,
          order.payment_method,
          order.payment_status || 'N/A',
          order.subtotal,
          order.delivery_fee,
          order.total,
          new Date(order.created_at).toLocaleString('pt-BR')
        ];
        csvData += row.join(';') + '\n';
      });

    } else if (type === 'products') {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          name,
          description,
          price,
          original_price,
          stock,
          is_active,
          is_featured,
          created_at
        `)
        .eq('store_id', storeId)
        .order('name');

      if (error) throw error;

      // Build CSV
      const headers = [
        'Nome', 'Descrição', 'Preço', 'Preço Original', 'Estoque', 'Ativo', 'Destaque', 'Criado em'
      ];
      
      csvData = headers.join(';') + '\n';
      
      products?.forEach(product => {
        const row = [
          product.name,
          product.description || '',
          product.price,
          product.original_price || '',
          product.stock,
          product.is_active ? 'Sim' : 'Não',
          product.is_featured ? 'Sim' : 'Não',
          new Date(product.created_at).toLocaleString('pt-BR')
        ];
        csvData += row.join(';') + '\n';
      });

    } else if (type === 'sales_report') {
      let query = supabase
        .from('orders')
        .select('total, status, payment_method, created_at')
        .eq('store_id', storeId)
        .in('status', ['confirmed', 'preparing', 'shipped', 'delivered']);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Group by date
      const salesByDate: Record<string, { count: number; total: number; methods: Record<string, number> }> = {};
      
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('pt-BR');
        if (!salesByDate[date]) {
          salesByDate[date] = { count: 0, total: 0, methods: {} };
        }
        salesByDate[date].count++;
        salesByDate[date].total += Number(order.total);
        salesByDate[date].methods[order.payment_method] = 
          (salesByDate[date].methods[order.payment_method] || 0) + 1;
      });

      const headers = ['Data', 'Pedidos', 'Total', 'Pix', 'Cartão', 'Dinheiro'];
      csvData = headers.join(';') + '\n';

      Object.entries(salesByDate)
        .sort((a, b) => new Date(b[0].split('/').reverse().join('-')).getTime() - 
                        new Date(a[0].split('/').reverse().join('-')).getTime())
        .forEach(([date, data]) => {
          const row = [
            date,
            data.count,
            data.total.toFixed(2),
            data.methods['pix'] || 0,
            data.methods['card'] || 0,
            data.methods['cash'] || 0
          ];
          csvData += row.join(';') + '\n';
        });
    }

    console.log(`Exporting ${type} for store ${storeId}`);

    return new Response(csvData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
