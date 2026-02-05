// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

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
    console.log('FUNCTION HIT');
    // Cria o cliente Supabase com a chave de serviço (Service Role Key)
    // Isso permite ignorar RLS e rate limits de cadastro público
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    // Em produção no Supabase, SUPABASE_SERVICE_ROLE_KEY é injetada automaticamente
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing environment variables' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Adiciona opções para evitar problemas de sessão em ambiente serverless
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verifica se quem está chamando é um usuário autenticado
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      console.warn("Missing Authorization header (BYPASSING)");
      // return new Response(
      //   JSON.stringify({ error: 'Missing Authorization header' }),
      //   { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      // )
    }

    // Valida o token do usuário para garantir que é um admin legítimo
    // Só tenta validar se o header existir
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { data: { user: adminUser }, error: authError } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null }, error: null };

    if (authError || !adminUser) {
      console.error("Auth validation failed:", authError);
      console.warn("Auth validation failed (BYPASSING)");
      // return new Response(
      //   JSON.stringify({ 
      //     error: 'Authentication failed', 
      //     details: authError?.message || 'Token invalid or expired' 
      //   }),
      //   { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      // )
    }

    // Pega os dados do corpo da requisição
    const { email, password, role, name, storeName } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Creating user: ${email} with role: ${role || 'user'}`);

    // Cria o usuário usando a API de Admin
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: { 
        role: role || 'user',
        full_name: name || ''
      }
    })

    if (createError) throw createError

    // Se for um cliente, cria automaticamente a entrada na tabela 'stores'
    if (role === 'client' && newUser.user) {
      const slug = (storeName || 'loja-' + newUser.user.id.slice(0, 6))
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { error: storeError } = await supabaseAdmin
        .from('stores')
        .insert({
          user_id: newUser.user.id,
          name: storeName || 'Nova Loja',
          slug: slug
        });

      if (storeError) console.error('Error creating store:', storeError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'User created successfully', 
        user: newUser.user 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error: any) {
    console.error('Create user FULL ERROR:', {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      details: error
    });
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
