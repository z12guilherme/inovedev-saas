import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Nota: Este middleware é otimizado para Vercel Edge Functions.
// Ele reescreve requisições de subdomínio para caminhos internos se necessário,
// mas como estamos usando SPA (Vite), o roteamento principal acontece no cliente (StoreContext).
// Este middleware serve principalmente para garantir que o hostname seja passado corretamente
// ou para separar a aplicação "App" (Admin) das "Lojas".

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto:
     * 1. /api/ (rotas de API)
     * 2. /_next/ (arquivos internos do Next.js, se houver)
     * 3. /_static (arquivos estáticos)
     * 4. arquivos com extensão (ex: .png, .css, .js)
     */
    "/((?!api/|_next/|_static|.*\\..*).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Defina seu domínio principal aqui para desenvolvimento e produção
  // Ex: inovedev.com.br ou localhost:3000
  const currentHost =
    process.env.NODE_ENV === "production"
      ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
      : hostname.replace(`.localhost:3000`, "");

  // Se for o domínio principal (app ou www), não faz nada (deixa o React Router lidar com /admin, etc)
  if (currentHost === "app" || currentHost === "www") {
    return NextResponse.next();
  }

  // Se for um subdomínio (ex: loja1), podemos reescrever para uma rota interna se quisermos
  // separar a lógica de roteamento, mas o StoreContext já lida com o hostname.
  // Por enquanto, apenas passamos a requisição.
  
  return NextResponse.next();
}