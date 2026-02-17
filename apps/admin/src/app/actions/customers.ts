'use server';

import { getTokenFromCookies } from '@/lib/auth';
import { authApiFetch, ApiError } from '@/lib/auth-api';

export interface Customer {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
}

export type GetCustomersResult =
  | { data: Customer[] }
  | { error: 'unauthorized' }
  | { error: 'api'; message: string; status?: number };

export async function getCustomers(
  q?: string,
): Promise<GetCustomersResult> {
  const token = await getTokenFromCookies();
  if (!token) return { error: 'unauthorized' };
  try {
    const path = q?.trim()
      ? `/customers?q=${encodeURIComponent(q.trim())}`
      : '/customers';
    const data = await authApiFetch<Customer[]>(path, token);
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        error: 'api',
        message: err.body?.message ?? 'Erro ao carregar clientes.',
        status: err.status,
      };
    }
    return { error: 'api', message: 'Erro ao carregar clientes.' };
  }
}
