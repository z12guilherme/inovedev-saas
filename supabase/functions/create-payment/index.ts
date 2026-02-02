import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Usamos a SERVICE_ROLE_KEY para ter permissão de ler o token do Mercado Pago (dado sensível)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { items, storeId, backUrls, orderId, payer, deliveryFee } = await req.json()

    // 1. Buscar configurações da loja para obter o Access Token
    const { data: settings, error: settingsError } = await supabaseClient
      .from('store_settings')
      .select('mercadopago_access_token')
      .eq('store_id', storeId)
      .single()

    // --- MODO SIMULAÇÃO (SANDBOX INTERNO) ---
    // Se não houver token ou se for um token de teste definido por nós, simulamos o pagamento.
    const isTestMode = !settings?.mercadopago_access_token || settings.mercadopago_access_token === 'TEST_TOKEN';

    if (isTestMode) {
      console.log('Modo Simulação Ativado para loja:', storeId);
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      
      // Retorna uma resposta fake que o frontend entende, redirecionando direto para a tela de sucesso
      return new Response(
        JSON.stringify({ 
          preferenceId: 'mock_preference_id_123', 
          initPoint: `${origin}/sucesso?collection_status=approved&payment_id=mock_123&external_reference=${orderId || 'test'}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- MODO REAL (MERCADO PAGO) ---
    // 2. Configurar Mercado Pago com o token da loja (Split Payment / Multi-tenant)
    const client = new MercadoPagoConfig({ accessToken: settings.mercadopago_access_token });
    const preference = new Preference(client);

    // Construir URL do Webhook apontando para nossa Edge Function com o ID da loja
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook?store_id=${storeId}`;

    // 3. Criar Preferência
    const result = await preference.create({
      body: {
        external_reference: orderId, // Vincula o pagamento ao pedido no nosso banco
        payer: payer ? {
          name: payer.name,
          phone: payer.phone ? {
            area_code: payer.phone.substring(0, 2),
            number: payer.phone.substring(2)
          } : undefined
        } : undefined,
        items: items.map((item: any) => ({
          id: item.id,
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL',
          picture_url: item.image
        })),
        shipments: deliveryFee ? {
          cost: Number(deliveryFee),
          mode: 'not_specified',
        } : undefined,
        notification_url: notificationUrl, // O Mercado Pago vai notificar aqui
        back_urls: backUrls || {
          success: `${req.headers.get('origin')}/sucesso`,
          failure: `${req.headers.get('origin')}/erro`,
          pending: `${req.headers.get('origin')}/pendente`,
        },
        auto_return: 'approved',
      }
    })

    return new Response(
      JSON.stringify({ preferenceId: result.id, initPoint: result.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})