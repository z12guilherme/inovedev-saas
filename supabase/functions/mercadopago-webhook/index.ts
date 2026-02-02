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

    const body = await req.json();
    
    console.log('Webhook received:', JSON.stringify(body));
    
    // Capturar store_id da URL (enviado pelo create-payment)
    const url = new URL(req.url);
    const storeId = url.searchParams.get('store_id');

    // Mercado Pago sends different notification types
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID in webhook');
        return new Response('OK', { headers: corsHeaders });
      }

      let accessToken = '';

      // 1. Se temos o store_id na URL (Método Otimizado)
      if (storeId) {
        const { data: settings } = await supabase
          .from('store_settings')
          .select('mercadopago_access_token')
          .eq('store_id', storeId)
          .single();
        
        if (settings?.mercadopago_access_token) {
          accessToken = settings.mercadopago_access_token;
        }
      } 
      
      // Se não achou token, aborta (segurança)
      if (!accessToken) {
        console.log('Could not find access token for store:', storeId);
        return new Response('OK', { headers: corsHeaders }); // Retorna OK para o MP parar de tentar
      }

      // 2. Consultar status no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!mpResponse.ok) {
        console.error('Error fetching payment from MP');
        return new Response('OK', { headers: corsHeaders });
      }

      const payment = await mpResponse.json();
      console.log('Payment status:', payment.status, 'Order ID:', payment.external_reference);

      // 3. Atualizar o pedido
      if (payment.external_reference) {
        await supabase
          .from('orders')
          .update({
            mercadopago_payment_id: String(paymentId),
            payment_status: payment.status,
            status: payment.status === 'approved' ? 'confirmed' : 
                    payment.status === 'rejected' ? 'cancelled' : 'pending'
          })
          .eq('id', payment.external_reference);
      }
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
