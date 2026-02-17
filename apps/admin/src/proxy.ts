import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'sb-access-token';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas: login e fluxos de auth
  if (pathname === '/login' || pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and _next.
     * Rotas públicas (/login, /auth/*) são tratadas dentro do middleware.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
