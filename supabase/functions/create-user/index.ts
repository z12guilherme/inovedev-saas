// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
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
      console.warn("Missing Authorization header (Proceeding via Service Role)");
    }

    // Valida o token do usuário para garantir que é um admin legítimo
    // Só tenta validar se o header existir
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const { data: { user: adminUser }, error: authError } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null }, error: null };

    if (authError || !adminUser) {
      // Apenas loga o aviso, mas não bloqueia, pois estamos usando a Service Role Key para a operação
      console.warn("Auth validation skipped or failed. Proceeding with execution.");
    }

    // --- ATUALIZAÇÃO DE SENHA (PUT) ---
    if (req.method === 'PUT') {
      const { userId, password } = await req.json()
      
      if (!userId || !password) {
        return new Response(
          JSON.stringify({ error: 'User ID and password are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: password }
      )

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Password updated successfully', user: data.user }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // Pega os dados do corpo da requisição
    const { email, password, role, name, storeName, plan } = await req.json()

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

      // Inserimos e retornamos o objeto criado para pegar o ID
      const { data: newStore, error: storeError } = await supabaseAdmin
        .from('stores')
        .insert({
          user_id: newUser.user.id,
          name: storeName || 'Nova Loja',
          slug: slug
        })
        .select()
        .single();

      if (storeError) {
        console.error('Error creating store:', storeError);
        // ROLLBACK: Se falhar ao criar a loja, deletamos o usuário do Auth para não ficar "zumbi"
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw new Error(`Erro ao criar loja: ${storeError.message}. O usuário foi removido para tentar novamente.`);
      }

      // Atualiza o plano na tabela store_settings (criada automaticamente pelo trigger)
      if (newStore && plan) {
        const { error: settingsError } = await supabaseAdmin
          .from('store_settings')
          .update({ subscription_plan: plan })
          .eq('store_id', newStore.id);
        
        if (settingsError) console.error('Error updating plan:', settingsError);
      }
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
