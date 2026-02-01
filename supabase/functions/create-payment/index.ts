import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  store_id: string;
  order_id: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    name: string;
    email?: string;
    phone: string;
  };
  delivery_fee: number;
  redirect_url: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: PaymentRequest = await req.json();
    
    console.log('Processing payment for order:', body.order_id);

    // Get store settings with Mercado Pago credentials
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('mercadopago_access_token, mercadopago_enabled')
      .eq('store_id', body.store_id)
      .single();

    if (settingsError || !settings) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Store settings not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!settings.mercadopago_enabled || !settings.mercadopago_access_token) {
      return new Response(
        JSON.stringify({ error: 'Mercado Pago not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add delivery fee as an item
    const items = [
      ...body.items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'BRL'
      }))
    ];

    if (body.delivery_fee > 0) {
      items.push({
        title: 'Taxa de entrega',
        quantity: 1,
        unit_price: body.delivery_fee,
        currency_id: 'BRL'
      });
    }

    // Create preference on Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.mercadopago_access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items,
        payer: {
          name: body.payer.name,
          email: body.payer.email || undefined,
          phone: {
            number: body.payer.phone.replace(/\D/g, '')
          }
        },
        back_urls: {
          success: `${body.redirect_url}?status=success`,
          failure: `${body.redirect_url}?status=failure`,
          pending: `${body.redirect_url}?status=pending`
        },
        auto_return: 'approved',
        external_reference: body.order_id,
        notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`
      })
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Mercado Pago error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error creating payment preference' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preference = await mpResponse.json();

    console.log('Payment preference created:', preference.id);

    // Update order with preference ID
    await supabase
      .from('orders')
      .update({ 
        mercadopago_preference_id: preference.id,
        payment_status: 'pending'
      })
      .eq('id', body.order_id);

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
