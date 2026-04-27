# Roadmap de Desenvolvimento - Inove Commerce SaaS

Este documento lista as tarefas necessárias para transformar o protótipo atual em um SaaS funcional, seguro e pronto para produção na Vercel.

---

## 🚀 Próximos Passos Imediatos (Foco: Pagamentos)

- [x] **Deploy da Edge Function `create-payment`**
    - [x] Função atualizada para suportar "Modo Simulação" (Sandbox Local).
    - [x] Realizar deploy atualizado: `npx supabase functions deploy create-payment`. ✅

- [x] **Integração no Frontend (`CartContext`)**
    - Conectar o formulário de checkout para chamar `supabase.functions.invoke('create-payment')`.
    - Redirecionamento para o Mercado Pago implementado.

- [x] **Webhook de Notificações (`mercadopago-webhook`)**
    - [x] Código criado em `supabase/functions/mercadopago-webhook`.
    - [x] **Deploy realizado.** ✅
    - [x] **Credenciais:** Chaves de teste obtidas (`APP_USR...`).
    - [ ] **Pendente:** Inserir no Admin e realizar compra de teste.

---

##  Prioridade Zero (Core Fixes)

Estas tarefas são bloqueantes. A loja não funciona dinamicamente sem elas.

- [x] **Remover Mocks do StoreContext**
    - O arquivo `src/contexts/StoreContext.tsx` usa dados estáticos (`mockStoreConfig`, `mockProducts`).
    - **Ação:** Reescrever o `StoreProvider` para buscar dados do Supabase baseados no `slug` da URL ou subdomínio.
    - **Query:** Buscar `store_settings`, `categories` e `products` onde `store_id` corresponde ao slug atual.

- [x] **Unificar Tipos**
    - Garantir que os tipos em `src/types/index.ts` correspondam exatamente às tabelas do Supabase (`database.types.ts`).

- [x] **Persistência de Imagens**
    - O upload de imagens no Admin funciona, mas o frontend precisa resolver as URLs corretamente do Supabase Storage (bucket `store-assets`).

- [x] **Correção de Permissões (RLS)**
    - Criada função RPC `create_complete_order` para permitir criação de pedidos por usuários anônimos sem erro 401.

---

## 1️⃣ Frontend (Storefront & Admin)

### Storefront (Loja do Cliente)
- [x] **Roteamento Dinâmico**
    - Detectar acesso via `/loja/[slug]` ou subdomínio `[slug].inovedev.com.br`.

- [ ] **Renderização do Construtor Visual**
    - Ler tabela `store_sections` e renderizar componentes dinamicamente conforme a ordem definida no Admin.

- [x] **SEO Dinâmico**
    - Usar `react-helmet-async` para alterar título, descrição e favicon com base nas configurações da loja. ✅

### Admin Dashboard
- [x] **Dashboard Home**
    - Substituir gráficos estáticos por dados reais de `orders` (Vendas hoje, Pedidos pendentes).

- [x] **Gestão de Pedidos**
    - Tela para visualizar detalhes do pedido e alterar status (Pendente → Enviado → Entregue).
    - Botão para "Enviar atualização no WhatsApp do cliente". ✅

---

## 2️⃣ Backend & Integrações

### Supabase & Edge Functions
- [x] **Deploy de Edge Functions**
    - [x] `create-user` (Cadastro de clientes/lojas)
    - [x] `create-payment` (Checkout Pro) ✅
    - [x] `mercadopago-webhook` (Atualização de status) ✅

- [x] **Webhooks Mercado Pago**
    - Receber notificações de pagamento aprovado e atualizar status de pedido na tabela `orders`.
    - ✅ **Automático:** O `create-payment` já envia `notification_url` dinâmico com o `store_id` correto em cada preferência criada. Não é necessário configurar nada manualmente no painel do Mercado Pago.
    - [ ] **Pendente:** Inserir token MP real no Admin da loja e realizar compra de teste para validar o fluxo.

### Checkout
- [x] **Integração Real Mercado Pago**
    - [x] Implementado modo Mock/Sandbox na Edge Function para testes sem conta MP.
    - Exibir QR Code Pix ou link de pagamento na tela de sucesso.

---

## 3️⃣ Infraestrutura SaaS & Vercel

- [x] **Deploy em Produção**
    - Projeto rodando na Vercel: [https://saas.inovedev.com.br](https://saas.inovedev.com.br)

- [x] **Domínio Personalizado (Híbrido)**
    - [x] DNS configurado no Netlify (CNAME para `saas` e `*` apontando para Vercel).
    - [x] Site institucional mantido no Netlify.

- [x] **Middleware Vercel (Subdomínios)**
    - `middleware.ts` para reescrever URLs. Ex: `loja1.inovedev.com.br` → `/loja/loja1`.

- [x] **Variáveis de Ambiente**
    - `.env.local` e Vercel:
        - `VITE_SUPABASE_URL`
        - `VITE_SUPABASE_ANON_KEY`
        - `SUPABASE_SERVICE_ROLE_KEY` (apenas para Edge Functions)
        - `MP_ACCESS_TOKEN`

---

## 4️⃣ Design & UX

- [x] **Loading States**
    - Skeletons para produtos, categorias e seções do construtor.

- [x] **Página 404 Personalizada**
    - "Loja não encontrada" amigável com link para criar nova loja.

- [x] **Feedback Visual**
    - Toasts de erro/sucesso (`sonner`), manter padrão. ✅ (já em uso em toda a aplicação)

---

## 5️⃣ Monetização do SaaS (Futuro)

- [ ] **Planos de Assinatura**
    - Tabela `saas_subscriptions` para controlar pagamento de lojistas.
    - Bloquear acesso ao Admin se assinatura vencida.

---

## 📅 Ordem de Execução Recomendada

1. **Correção do Contexto (Priority Zero)** → Loja lendo dados reais.  
2. **Checkout Real** → Integração Mercado Pago funcionando.  
3. **Middleware / Deploy Vercel** → Suporte a subdomínios ativo.  
4. **Refinamento do Construtor Visual** → Drag-and-drop refletindo na loja dinamicamente.  
5. **Dashboard Analytics** → Visibilidade de vendas e pedidos para lojistas.

---

## 📝 Observações

- Revisar nomes e tipos das tabelas Supabase antes de ligar o StoreContext.  
- Garantir consistência do frontend e backend com multi-tenant.  
- Testar cada loja com subdomínio antes do deploy final.
