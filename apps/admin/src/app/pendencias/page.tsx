'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPendingAppointments, patchAppointment, type Appointment } from '@/app/actions/appointments';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PendenciasPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPendingAppointments();
    if ('error' in result) {
      if (result.error === 'unauthorized') {
        router.push('/login');
        return;
      }
      setError(result.message ?? 'Erro ao carregar pendências.');
    } else {
      setAppointments(result.data);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleBilling(id: string, billingStatus: string) {
    setActionLoading(id);
    const result = await patchAppointment(id, { action: 'set_billing', billingStatus });
    setActionLoading(null);
    if ('error' in result) {
      if (result.error === 'unauthorized') {
        router.push('/login');
        return;
      }
      alert(result.message ?? 'Erro ao atualizar.');
      return;
    }
    await fetchPending();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Pendências de pagamento
      </h1>

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
      ) : appointments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma pendência encontrada.
        </p>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {apt.customer.fullName}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {apt.service.name} · {formatDateTime(apt.startAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={actionLoading === apt.id}
                  onClick={() => handleBilling(apt.id, 'PAID_MANUAL')}
                  className="rounded bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900 dark:text-green-300"
                >
                  Pago
                </button>
                <button
                  disabled={actionLoading === apt.id}
                  onClick={() => handleBilling(apt.id, 'WAIVED')}
                  className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Dispensar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
