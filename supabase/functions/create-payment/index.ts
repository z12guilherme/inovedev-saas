import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('📦 Payload recebido:', { storeId, orderId, backUrls }); // Debug

    // Garantir URLs de retorno válidas para evitar erro "auto_return invalid"
    let origin = req.headers.get('origin') || req.headers.get('referer')

    // Tratar casos onde origin é "null", "undefined" ou vazio
    if (!origin || origin === 'null' || origin === 'undefined') {
      origin = 'https://saas.inovedev.com.br'; // Domínio de fallback seguro
    } else {
      try {
        origin = new URL(origin).origin
      } catch (e) {
        origin = 'https://saas.inovedev.com.br'
      }
    }

    // Função auxiliar para garantir URL válida
    const getValidUrl = (url: string | undefined, fallbackPath: string) => {
      let validUrl = (url && typeof url === 'string' && url.startsWith('http')) ? url : `${origin}${fallbackPath}`;

      try {
        const parsed = new URL(validUrl);
        // O Mercado Pago bloqueia qualquer IP local, localhost, ou URLs sem HTTPS em back_urls
        if (
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('192.168.') ||
          parsed.protocol === 'http:'
        ) {
          validUrl = `https://saas.inovedev.com.br${parsed.pathname}${parsed.search}`;
        }
      } catch (e) {
        validUrl = `https://saas.inovedev.com.br${fallbackPath}`;
      }

      return validUrl;
    };

    const finalBackUrls = {
      success: getValidUrl(backUrls?.success, '/sucesso'), // Obrigatório para auto_return
      failure: getValidUrl(backUrls?.failure, '/erro'),
      pending: getValidUrl(backUrls?.pending, '/pendente'),
    };

    console.log('🔗 URLs de Retorno:', finalBackUrls); // Debug

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
    // Construir URL do Webhook apontando para nossa Edge Function com o ID da loja
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    let notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook?store_id=${storeId}`;

    // Previne erro similar no webhook se testando com o Supabase CLI (local)
    if (notificationUrl.includes('localhost') || notificationUrl.includes('127.0.0.1')) {
      notificationUrl = `https://bxsbbuxaqffajqlhgqnz.supabase.co/functions/v1/mercadopago-webhook?store_id=${storeId}`;
    }

    const preferenceBody = {
      external_reference: orderId,
      payer: payer ? {
        name: payer.name,
        email: payer.email && payer.email.includes('@') ? payer.email : `cliente.${Date.now()}@teste.com`, // Força e-mail anônimo se vazio
        phone: payer.phone && payer.phone.length >= 10 ? {
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
      notification_url: notificationUrl,
      back_urls: finalBackUrls,
      auto_return: 'approved',
    };

    console.log('🚀 Enviando para Mercado Pago:', JSON.stringify(preferenceBody)); // Debug

    // 3. Criar Preferência
    // Substituindo SDK por fetch direto para evitar erro de compatibilidade no Deno (l.headers.raw is not a function)
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.mercadopago_access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceBody)
    });

    const result = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago API Error:', result);
      throw new Error(result.message || 'Erro ao criar preferência no Mercado Pago');
    }

    // 4. Atualizar o pedido com o ID da preferência (Seguro via Service Role)
    if (orderId && result.id) {
      await supabaseClient
        .from('orders')
        .update({ mercadopago_preference_id: result.id })
        .eq('id', orderId)
    }

    return new Response(
      JSON.stringify({ preferenceId: result.id, initPoint: result.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment creation error:', error); // Log para debug no Supabase
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})