import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializa o cliente Supabase com a chave de serviço para ter permissão de escrita
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    // O Mercado Pago pode enviar o ID na query string ou no corpo
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')
    const storeId = url.searchParams.get('store_id') // Presente apenas nos pagamentos de lojas (Checkout)

    const body = await req.json().catch(() => ({}))
    const paymentId = body.data?.id || id
    const type = body.type || topic

    // Processar apenas notificações de pagamento
    if (type === 'payment' && paymentId) {
      console.log(`Processing payment notification: ${paymentId}`)

      // Inteligência Multi-tenant: Decide qual token usar
      let accessToken = Deno.env.get('MP_ACCESS_TOKEN'); // Token do dono do SaaS (para assinaturas)

      if (storeId) {
        // É pagamento de cliente final na loja, precisamos do token da loja!
        const { data: settings } = await supabase
          .from('store_settings')
          .select('mercadopago_access_token')
          .eq('store_id', storeId)
          .single()

        if (settings?.mercadopago_access_token) {
          accessToken = settings.mercadopago_access_token
        }
      }

      // Consultar a API do Mercado Pago para confirmar o status atual
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (mpResponse.ok) {
        const paymentData = await mpResponse.json()
        const status = paymentData.status
        const externalReference = paymentData.external_reference // ID do pedido no nosso banco

        console.log(`Payment ${paymentId} status: ${status} for order ${externalReference}`)

        // Mapear status do MP para status do nosso sistema
        let newStatus = null
        if (status === 'approved') newStatus = 'confirmed'
        else if (status === 'rejected' || status === 'cancelled') newStatus = 'cancelled'

        if (externalReference && newStatus) {
          // Diferenciar Assinatura do SaaS vs Pedido de Loja
          if (externalReference.startsWith('SAAS_SUB_')) {
            const subStoreId = externalReference.replace('SAAS_SUB_', '');
            let subStatus = newStatus === 'confirmed' ? 'active' : 'inactive';

            const { error } = await supabase
              .from('stores')
              .update({ subscription_status: subStatus })
              .eq('id', subStoreId)

            if (error) console.error('Error updating store subscription:', error)
            else console.log(`Store ${subStoreId} subscription updated to ${subStatus}`)
          } else {
            // É um pedido normal de loja
            const { error } = await supabase
              .from('orders')
              .update({ status: newStatus })
              .eq('id', externalReference)

            if (error) console.error('Error updating order:', error)
            else console.log(`Order ${externalReference} updated to ${newStatus}`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})