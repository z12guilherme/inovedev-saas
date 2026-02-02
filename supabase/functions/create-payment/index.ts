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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { items, storeId, backUrls } = await req.json()

    // 1. Buscar configurações da loja para obter o Access Token
    const { data: settings, error: settingsError } = await supabaseClient
      .from('store_settings')
      .select('mercadopago_access_token')
      .eq('store_id', storeId)
      .single()

    if (settingsError || !settings?.mercadopago_access_token) {
      throw new Error('Loja não configurada para pagamentos ou token inválido')
    }

    // 2. Configurar Mercado Pago com o token da loja (Split Payment / Multi-tenant)
    const client = new MercadoPagoConfig({ accessToken: settings.mercadopago_access_token });
    const preference = new Preference(client);

    // 3. Criar Preferência
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL',
          picture_url: item.image
        })),
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