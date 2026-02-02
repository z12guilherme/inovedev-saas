# 🚀 Inove Commerce SaaS

> Plataforma de e-commerce White-label e Multi-tenant moderna, escalável e pronta para o mercado.

[!React](https://react.dev)
[!TypeScript](https://www.typescriptlang.org/)
[!Supabase](https://supabase.com)
[!Vercel](https://vercel.com)
[!Mercado Pago](https://www.mercadopago.com.br)

**🌐 Demo ao Vivo:** [https://inovedev-saas.vercel.app](https://inovedev-saas.vercel.app)

O **Inove Commerce SaaS** é uma solução completa para criação de lojas virtuais, permitindo que empreendedores gerenciem seus produtos, pedidos e aparência da loja em um ambiente unificado, enquanto oferece aos clientes finais uma experiência de compra fluida e rápida.

---

## ✨ Funcionalidades Principais

### 🛍️ Para o Cliente Final (Storefront)
- **Navegação Rápida:** SPA otimizado com Vite.
- **Checkout Transparente:** Integração nativa com Mercado Pago (Pix e Cartão) e pedidos via WhatsApp.
- **Carrinho Inteligente:** Persistência local e cálculo de frete/total em tempo real.
- **Design Responsivo:** Interface mobile-first adaptável a qualquer dispositivo.

### 🏢 Para o Lojista (Admin)
- **Dashboard Intuitivo:** Visão geral de vendas, pedidos e métricas.
- **Gestão de Produtos:** Controle de estoque, variações, imagens e categorias.
- **Construtor Visual:** Personalização da aparência da loja (Banners, Cores, Seções).
- **Multi-tenant:** Cada loja possui seu próprio subdomínio (ex: `loja1.inovedev.com.br`) e dados isolados.

### ⚙️ Backend & Infraestrutura
- **Supabase:** Banco de dados PostgreSQL, Autenticação e Storage.
- **Edge Functions:** Processamento serverless para checkout seguro e webhooks.
- **Middleware Vercel:** Roteamento dinâmico de subdomínios.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **State Management:** React Context API (StoreContext, CartContext).
- **Backend:** Supabase (Database, Auth, Storage, Edge Functions).
- **Pagamentos:** SDK Mercado Pago.
- **Deploy:** Vercel.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- Conta no Supabase
- Conta no Mercado Pago (para checkout)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/inovedev-saas.git
cd inovedev-saas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_key_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key # Apenas para Edge Functions locais

# Configuração de Domínio
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000 # ou seu dominio em produção

# Mercado Pago (Opcional para dev)
MP_ACCESS_TOKEN=seu_access_token_mp
```

### 4. Execute o projeto
```bash
npm run dev
```
Acesse `http://localhost:3000` para a landing page ou `http://loja1.localhost:3000` para simular uma loja (necessário configurar hosts locais ou usar roteamento manual).

---

## 📂 Estrutura do Projeto

```
inovedev-saas/
├── src/
│   ├── components/     # Componentes UI reutilizáveis (Admin, Storefront, UI)
│   ├── contexts/       # Gestão de estado (Cart, Store, Auth)
│   ├── integrations/   # Clientes externos (Supabase)
│   ├── pages/          # Rotas da aplicação
│   │   ├── admin/      # Painel do Lojista
│   │   └── ...         # Storefront e Landing Page
│   └── types/          # Definições de tipos TypeScript
├── supabase/
│   ├── functions/      # Edge Functions (create-payment, create-user)
│   └── migrations/     # Schemas do Banco de Dados
└── vercel.json         # Configuração de Roteamento SPA (Vercel)
```

---

## 🗺️ Roadmap

Confira o arquivo TODO.md para acompanhar o desenvolvimento das próximas features, como:
- [ ] Webhooks de notificação de pagamento.
- [ ] Planos de assinatura SaaS.
- [ ] Melhorias no SEO dinâmico.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

<div align="center">
  <sub>Desenvolvido com ❤️ pela equipe Inove Dev</sub>
</div>
