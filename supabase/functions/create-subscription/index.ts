import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { storeId, price, planName, email } = await req.json()

        // O token de acesso aqui é o SEU token (Dono do SaaS), pois o lojista vai pagar PARA VOCÊ.
        const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');

        if (!mpAccessToken) {
            throw new Error('Token do Mercado Pago da plataforma não configurado.');
        }

        let origin = req.headers.get('origin') || 'https://saas.inovedev.com.br';

        // Configuração da assinatura (Preapproval) no Mercado Pago
        const subscriptionBody = {
            reason: `Assinatura ${planName} - Inove Commerce`,
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: Number(price),
                currency_id: "BRL"
            },
            back_url: `${origin}/admin`,
            payer_email: email || "lojista@inovedev.com.br",
            external_reference: storeId // Importante: para identificarmos a loja que pagou no futuro
        };

        const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionBody)
        });

        const result = await mpResponse.json();

        if (!mpResponse.ok) {
            console.error('MP Subscription Error:', result);
            throw new Error(result.message || 'Erro ao criar link de assinatura no Mercado Pago');
        }

        // Retorna o link de pagamento da assinatura (init_point)
        return new Response(
            JSON.stringify({ initPoint: result.init_point }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Subscription creation error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})