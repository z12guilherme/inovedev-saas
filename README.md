--- c/Users/Padrão/Desktop/inovedev-saas/README.md
+++ c/Users/Padrão/Desktop/inovedev-saas/README.md
@@ -1,60 +1,40 @@
-# Welcome to your Lovable project
+# Inove Commerce SaaS
 
-## Project info
+Plataforma SaaS de e-commerce multi-tenant, permitindo que lojistas criem suas lojas virtuais personalizadas com checkout integrado (WhatsApp e Mercado Pago).
 
-**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
+## 🚀 Tecnologias
 
-## How can I edit this code?
+- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
+- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
+- **Pagamentos:** Integração com Mercado Pago (Pix e Cartão)
+- **Deploy:** Vercel (com suporte a subdomínios)
 
-There are several ways of editing your application.
+## 🛠️ Configuração Local
 
-**Use Lovable**
+1. **Clone o repositório**
+```sh
+git clone <URL_DO_REPO>
+cd inovedev-saas
+```
 
-Simply visit the Lovable Project and start prompting.
+2. **Instale as dependências**
+```sh
+npm install
+```
 
-Changes made via Lovable will be committed automatically to this repo.
+3. **Configure as variáveis de ambiente**
+Crie um arquivo `.env` na raiz com suas credenciais do Supabase:
+```env
+VITE_SUPABASE_URL=sua_url_supabase
+VITE_SUPABASE_PUBLISHABLE_KEY=sua_key_anonima
+```
 
-**Use your preferred IDE**
+4. **Inicie o servidor de desenvolvimento**
+```sh
+npm run dev
+```
 
-If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.
+## 📋 Roadmap
 
-The only requirement is having Node.js & npm installed - install with nvm
-
-Follow these steps:
-
-```sh
-# Step 1: Clone the repository using the project's Git URL.
-git clone <YOUR_GIT_URL>
-
-# Step 2: Navigate to the project directory.
-cd <YOUR_PROJECT_NAME>
-
-# Step 3: Install the necessary dependencies.
-npm i
-
-# Step 4: Start the development server with auto-reloading and an instant preview.
-npm run dev
-```
-
-**Edit a file directly in GitHub**
-
-- Navigate to the desired file(s).
-- Click the "Edit" button (pencil icon) at the top right of the file view.
-- Make your changes and commit the changes.
-
-**Use GitHub Codespaces**
-
-- Navigate to the main page of your repository.
-- Click on the "Code" button (green button) near the top right.
-- Select the "Codespaces" tab.
-- Click on "New codespace" to launch a new Codespace environment.
-- Edit files directly within the Codespace and commit and push your changes once you're done.
-
-## What technologies are used for this project?
-
-This project is built with:
-
-- Vite
-- TypeScript
-- React
-- shadcn-ui
-- Tailwind CSS
-
-## How can I deploy this project?
-
-Simply open Lovable and click on Share -> Publish.
-
-## Can I connect a custom domain to my Lovable project?
-
-Yes, you can!
-
-To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.
-
-Read more here: Setting up a custom domain
+Consulte o arquivo `TODO.md` para ver o status atual e as próximas tarefas.
