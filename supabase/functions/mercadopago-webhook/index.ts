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

    // Mercado Pago sends different notification types
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID in webhook');
        return new Response('OK', { headers: corsHeaders });
      }

      // Get the order with this preference to find the access token
      const { data: orders } = await supabase
        .from('orders')
        .select('id, store_id, mercadopago_preference_id')
        .not('mercadopago_preference_id', 'is', null);

      if (!orders || orders.length === 0) {
        console.log('No orders with MP preference found');
        return new Response('OK', { headers: corsHeaders });
      }

      // Try to find the order and get payment details
      for (const order of orders) {
        const { data: settings } = await supabase
          .from('store_settings')
          .select('mercadopago_access_token')
          .eq('store_id', order.store_id)
          .single();

        if (!settings?.mercadopago_access_token) continue;

        // Get payment details from Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${settings.mercadopago_access_token}`
          }
        });

        if (!mpResponse.ok) continue;

        const payment = await mpResponse.json();
        
        console.log('Payment status:', payment.status, 'External ref:', payment.external_reference);

        // Check if this payment is for one of our orders
        if (payment.external_reference) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              mercadopago_payment_id: String(paymentId),
              payment_status: payment.status,
              status: payment.status === 'approved' ? 'confirmed' : 
                      payment.status === 'rejected' ? 'cancelled' : 'pending'
            })
            .eq('id', payment.external_reference);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log('Order updated successfully');
          }
          break;
        }
      }
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
