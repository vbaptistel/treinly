import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Hosts que não são subdomínios de tenant
const PLATFORM_HOSTS = ['treinly.app', 'www.treinly.app'];

function isIP(host: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host) || host.startsWith('[');
}

function extractSubdomainSlug(host: string): string | null {
  const hostname = host.split(':')[0]; // remover porta

  if (isIP(hostname)) return null;
  if (hostname === 'localhost') return null;

  const parts = hostname.split('.');
  // Ex: joao.treinly.com → parts = ['joao', 'treinly', 'com']
  // Precisa de pelo menos 3 partes para ter subdomínio
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  if (subdomain === 'www') return null;

  return subdomain;
}

export async function proxy(request: NextRequest) {
  const host = request.nextUrl.hostname;
  console.log('---- HEADERS ----');
  request.headers.forEach((v, k) => {
    console.log(k, v);
  });
  console.log('nextUrl', request.nextUrl.href);

  let slug: string | null = null;

  // 0. Dev-only: query param ?_slug= para testar temas localmente
  if (process.env.NODE_ENV === 'development') {
    const qsSlug = request.nextUrl.searchParams.get('_slug');
    if (qsSlug) slug = qsSlug;
  }

  // 1. Tentar extrair slug do subdomínio
  if (!slug) slug = extractSubdomainSlug(host);

  // 2. Se não for subdomínio, verificar custom domain via API
  if (!slug) {
    const hostname = host.split(':')[0];
    const isPlatform =
      PLATFORM_HOSTS.includes(hostname) ||
      hostname === 'localhost' ||
      isIP(hostname);

    if (!isPlatform) {
      try {
        const res = await fetch(
          `${API_URL}/public/resolve-host?host=${encodeURIComponent(hostname)}`,
        );
        if (res.ok) {
          const data = await res.json();
          slug = data.slug ?? null;
        }
      } catch {
        // API indisponível — segue sem slug
      }
    }
  }

  // 3. Injetar slug no header x-tenant-slug
  if (slug) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', slug);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/agendar'],
};
