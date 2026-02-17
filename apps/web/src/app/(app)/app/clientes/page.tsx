'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authApiFetch } from '@/lib/auth-api';

interface Customer {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const token = getToken();
        if (!token) {
          setError('Sessão expirada. Faça login novamente.');
          setLoading(false);
          return;
        }
        const data = await authApiFetch<Customer[]>('/customers', token);
        setCustomers(data);
      } catch {
        setError('Erro ao carregar clientes.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Clientes
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum cliente cadastrado.
        </p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/app/clientes/${c.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {c.fullName}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {c.phoneE164}
                  {c.email && ` · ${c.email}`}
                </p>
              </div>
              <span className="text-zinc-400">&rarr;</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]*)/);
  return match?.[1] ?? null;
}
