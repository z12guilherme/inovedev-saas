# 📘 Guia Definitivo: Integração Mercado Pago (Checkout Pro)

Este documento detalha a arquitetura, o fluxo de dados e os "segredos" da implantação do Mercado Pago no Inove Commerce SaaS. Use este guia para futuras manutenções ou para espelhar a integração em outros projetos.

---

## 🏗️ 1. Arquitetura da Integração

Nossa integração utiliza o **Checkout Pro** (redirecionamento) e é dividida em 3 partes principais:

1. **Frontend (React):** Coleta os dados do cliente, monta o carrinho e aciona a Edge Function.
2. **Edge Function (`create-payment`):** Autentica com o banco (burlamento de RLS via Service Role para pegar o Access Token da loja), formata os dados rigorosamente e cria a "Preferência de Pagamento" na API do Mercado Pago.
3. **Edge Function (`mercadopago-webhook`):** Recebe os "avisos silenciosos" (Webhooks) do Mercado Pago, consulta o status real da transação e atualiza o pedido no banco de dados para `confirmed` ou `cancelled`.

---

## 🚨 2. Regras de Ouro e "Pegadinhas" da API

Durante o desenvolvimento, mapeamos comportamentos ocultos da API do Mercado Pago. **Nunca ignore estas regras:**

### ❌ Erro: `auto_return invalid. back_url.success must be defined`
* **O que é:** O Mercado Pago bloqueia redirecionamentos automáticos se a URL de retorno for `localhost`, um IP local (ex: `192.168.x.x`) ou se não tiver `https://`.
* **A Solução:** Na Edge Function, interceptamos a URL. Se o cliente estiver rodando localmente, forçamos um domínio de *fallback* de produção (`https://saas.inovedev.com.br`) apenas para a API aceitar o payload.

### ❌ Erro: `account_money cannot be excluded` ou `invalid default_payment_method_id`
* **O que é:** Ocorre ao tentar forçar a tela a abrir no PIX (`default_payment_method_id: 'pix'`) ou proibir o uso de saldo em conta. A API rejeita dependendo do nível de validação da conta do lojista.
* **A Solução:** **Não envie o objeto `payment_methods`**. Deixe o payload "limpo". O Mercado Pago deve decidir sozinho quais métodos exibir baseado nas configurações do painel do vendedor.

### ❌ Erro: "Você não pode pagar para si mesmo" / Saldo Insuficiente
* **O que é:** Ocorre nos testes quando o desenvolvedor usa o próprio e-mail ou está com o App do MP logado no celular. O MP tenta usar o saldo da conta dona da loja.
* **A Solução:** Na Edge Function, se o e-mail vier vazio, criamos um e-mail falso (`cliente.timestamp@teste.com`). Nos testes, **sempre use aba anônima no PC** com dados fictícios.

---

## 💻 3. O Payload Perfeito (Edge Function)

Abaixo está a estrutura blindada do corpo enviado para `https://api.mercadopago.com/checkout/preferences`:

```javascript
const preferenceBody = {
  external_reference: orderId, // ID do pedido no nosso banco (Crucial para o Webhook)
  payer: {
    name: "Nome do Cliente",
    email: "email.valido@ou.falso.com", // Obrigatório ter '@'
    phone: {
      area_code: "11",
      number: "999999999" // Apenas números, mínimo 8 dígitos
    }
  },
  items: [
    {
      id: "prod_123",
      title: "Nome do Produto",
      quantity: 1,
      unit_price: 50.00, // Deve ser Number, não string
      currency_id: 'BRL',
      picture_url: "https://..." // Opcional, mas não pode ser 'null'
    }
  ],
  shipments: {
    cost: 15.00, // Frete
    mode: 'not_specified'
  },
  notification_url: "https://api.sua-loja.com/webhook?store_id=123", // Webhook com ID dinâmico (Multi-tenant)
  back_urls: {
    success: "https://sua-loja.com/sucesso", // Deve ser HTTPS e não-local
    failure: "https://sua-loja.com/erro",
    pending: "https://sua-loja.com/pendente"
  },
  auto_return: 'approved' // Redireciona o usuário sozinho após o pagamento
};
```

---

## 🔄 4. O Fluxo do Webhook

O Webhook é o coração da operação assíncrona. Ele garante que, mesmo que o cliente feche a aba após pagar o Pix, o pedido mude para `confirmed`.

1. O MP envia um POST para nossa Edge Function.
2. O ID do pagamento pode vir de duas formas:
   * `req.url.searchParams.get('data.id')` (Formato antigo/Webhooks)
   * `req.body.data.id` (Formato novo/Notificações IPN)
3. **Segurança:** O Webhook NUNCA confia no status enviado no payload inicial. Ele pega o `ID` recebido e **faz uma nova requisição (GET)** para a API do MP (`/v1/payments/{id}`).
4. O Webhook lê o `external_reference` (nosso ID do pedido) retornado pela API e atualiza a tabela `orders` ignorando o RLS (via `SUPABASE_SERVICE_ROLE_KEY`).

---

## 🧪 5. Guia de Testes à Prova de Falhas

Testar pagamentos é a parte onde mais se perde tempo. Siga exatamente estas regras:

### A. Testando com Credenciais de TESTE (`TEST-...`)
* **⚠️ PIX NÃO FUNCIONA NO MODO TESTE.** Se usar credenciais de teste, o MP oculta o botão de PIX e Boleto automaticamente (pois exigem interação bancária real).
* **Como testar:** O MP só aceitará os cartões fictícios oficiais deles.
* **O Truque da Aprovação:** Para forçar o pagamento a ser *Aprovado* e o webhook disparar `confirmed`, você DEVE usar os dados abaixo na tela do MP:
  * **Cartão:** `4235 6477 2802 5682` (Visa)
  * **Vencimento:** `11/30`
  * **CVV:** `123`
  * **Nome do Titular:** `APRO` (Exatamente esta palavra. Ela força a aprovação no sistema antifraude).
  * **CPF:** Qualquer CPF matematicamente válido.

### B. Testando com Credenciais de PRODUÇÃO (`APP_USR-...`)
* **⚠️ Requisito:** A conta do vendedor precisa ter o recebimento por PIX ativado nas configurações e a identidade (CPF/CNPJ) validada no painel do MP.
* **Como testar:**
  1. Altere o preço de um produto para R$ 1,00.
  2. **USE O COMPUTADOR** em uma **Guia Anônima** (Para evitar que abra o App do MP no celular e bloqueie dizendo "saldo insuficiente").
  3. Use um e-mail falso no checkout da loja (ex: `cliente.visitante@teste.com`).
  4. Escaneie o QR Code com o app do seu banco real (que não seja a conta dona da loja) e pague o R$ 1,00.
  5. O redirecionamento e o webhook acontecerão em tempo real.

---

> *Documentação gerada após o sucesso da implantação da V1 do sistema de pagamentos. Stack: React + Supabase Edge Functions (Deno) + Mercado Pago SDK REST.*