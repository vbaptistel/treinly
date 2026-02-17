const COOKIE_NAME = 'sb-access-token';
const COOKIE_MAX_AGE = 60 * 60; // 1h (o JWT do Supabase costuma expirar em 1h)

/**
 * Lê o token de acesso Supabase do cookie (client-side).
 * Usado nas páginas do painel para chamadas à API autenticada.
 */
export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`),
  );
  return match?.[1] ?? null;
}

/**
 * Grava o access token no cookie para que as chamadas à API (Bearer) funcionem.
 * Chamar após setSession/signIn no Supabase.
 */
export function setSessionCookie(accessToken: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
