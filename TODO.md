# Roadmap de Desenvolvimento - Inove Commerce SaaS

Este documento lista as tarefas necessárias para transformar o protótipo atual em um SaaS funcional, seguro e pronto para produção na Vercel.

---

## 🚀 Próximos Passos Imediatos (Foco: Pagamentos)

- [ ] **Deploy da Edge Function `create-payment`**
    - Função já criada em `supabase/functions/create-payment`.
    - Deploy realizado com sucesso.

- [x] **Integração no Frontend (`CartContext`)**
    - Conectar o formulário de checkout para chamar `supabase.functions.invoke('create-payment')`.
    - Redirecionamento para o Mercado Pago implementado.

- [ ] **Webhook de Notificações (`mercadopago-webhook`)**
    - [x] Código criado em `supabase/functions/mercadopago-webhook`.
    - [ ] **Pendente:** Deploy e configuração de segredos (`MP_ACCESS_TOKEN`).
    - [ ] **Pendente:** Teste real com conta bancária (Aguardando criação da conta).

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

---

## 1️⃣ Frontend (Storefront & Admin)

### Storefront (Loja do Cliente)
- [x] **Roteamento Dinâmico**
    - Detectar acesso via `/loja/[slug]` ou subdomínio `[slug].inovedev.com.br`.

- [ ] **Renderização do Construtor Visual**
    - Ler tabela `store_sections` e renderizar componentes dinamicamente conforme a ordem definida no Admin.

- [ ] **SEO Dinâmico**
    - Usar `react-helmet-async` para alterar título, descrição e favicon com base nas configurações da loja.

### Admin Dashboard
- [ ] **Dashboard Home**
    - Substituir gráficos estáticos por dados reais de `orders` (Vendas hoje, Pedidos pendentes).

- [ ] **Gestão de Pedidos**
    - Tela para visualizar detalhes do pedido e alterar status (Pendente → Enviado → Entregue).
    - Botão para "Enviar atualização no WhatsApp do cliente".

---

## 2️⃣ Backend & Integrações

### Supabase & Edge Functions
- [ ] **Deploy de Edge Functions**
    - [x] `create-user` (Cadastro de clientes/lojas)
    - [x] `create-payment` (Checkout Pro)
    - [ ] `mercadopago-webhook` (Atualização de status)

- [ ] **Webhooks Mercado Pago**
    - Receber notificações de pagamento aprovado e atualizar status de pedido na tabela `orders`.

### Checkout
- [x] **Integração Real Mercado Pago**
    - [x] No `CheckoutPage.tsx` (via `CartContext`), ao selecionar "Mercado Pago", chamar a Edge Function `create-payment`.
    - Exibir QR Code Pix ou link de pagamento na tela de sucesso.

---

## 3️⃣ Infraestrutura SaaS & Vercel

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

- [ ] **Feedback Visual**
    - Toasts de erro/sucesso (`sonner`), manter padrão.

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
