import { headers } from 'next/headers';

/**
 * Lê o slug do tenant injetado pelo middleware via header x-tenant-slug.
 * Usado em server components das rotas públicas sem slug na URL.
 */
export async function getTenantSlug(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-tenant-slug');
}
