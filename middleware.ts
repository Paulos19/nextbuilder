import NextAuth from "next-auth"
import authConfig from "./auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  webhookPrefix,
} from "@/routes"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isWebhookRoute = nextUrl.pathname.startsWith(webhookPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // 1. Sempre permitir rotas de API de Autenticação (NextAuth interno)
  if (isApiAuthRoute) {
    return; // Retorno undefined significa "continue"
  }

  // 2. Sempre permitir rotas de Webhook (A validação de segurança será feita dentro do Route Handler)
  if (isWebhookRoute) {
    return;
  }

  // 3. Lógica para rotas de Login/Registro
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Se já está logado e tenta acessar /login, manda pro dashboard
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return;
  }

  // 4. Lógica para rotas protegidas
  if (!isLoggedIn && !isPublicRoute) {
    // Se não está logado e a rota não é pública, redireciona para login
    // Salva a URL original para redirecionar de volta após o login (Callback URL) - opcional, mas boa prática UX
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  return;
})

// Opcionalmente, não invocar o middleware em alguns caminhos estáticos
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
