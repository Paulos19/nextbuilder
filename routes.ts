/**
 * Um array de rotas que são acessíveis ao público.
 * Estas rotas não requerem autenticação.
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  // Adicione landing pages, termos de uso, etc.
];

/**
 * Um array de rotas que são usadas para autenticação.
 * Estas rotas redirecionarão usuários logados para /dashboard
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
  "/register",
  "/error", // Opcional: Rota de erro do NextAuth
];

/**
 * O prefixo para rotas de API de autenticação.
 * Rotas que começam com este prefixo são usadas para o propósito de API do NextAuth e devem ser sempre públicas.
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * O prefixo para webhooks internos (ex: n8n).
 * Estas rotas ignoram a sessão do usuário, mas requerem validação de API Key.
 * @type {string}
 */
export const webhookPrefix = "/api/webhooks";

/**
 * A rota padrão para onde redirecionar o usuário após o login.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
