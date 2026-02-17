/**
 * Lê o token de acesso Supabase do cookie (client-side).
 * Usado nas páginas do painel para chamadas à API autenticada.
 */
export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]*)/);
  return match?.[1] ?? null;
}
