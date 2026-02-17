'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getCustomers,
  type Customer,
} from '@/app/actions/customers';

const DEBOUNCE_MS = 300;

export default function ClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const q = searchInput.trim() || undefined;
      setLoading(true);
      setError(null);
      getCustomers(q).then((result) => {
        if ('error' in result) {
          if (result.error === 'unauthorized') {
            router.push('/login');
            return;
          }
          setError(result.message ?? 'Erro ao carregar clientes.');
        } else {
          setCustomers(result.data);
        }
        setLoading(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, router]);

  const hasSearched = searchInput.trim().length > 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Clientes
      </h1>

      <div className="mb-4">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome, email ou telefone"
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          aria-label="Buscar clientes"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
          <Link
            href="/login"
            className="ml-1 font-medium underline hover:no-underline"
          >
            Fazer login
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {hasSearched
            ? 'Nenhum cliente encontrado.'
            : 'Digite para buscar ou exibir todos os clientes.'}
        </p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/clientes/${c.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {c.fullName}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {c.phoneE164}
                {c.email ? ` · ${c.email}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
