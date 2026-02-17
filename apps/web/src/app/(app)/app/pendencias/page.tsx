'use client';

import { useEffect, useState } from 'react';
import { authApiFetch, ApiError } from '@/lib/auth-api';

interface Appointment {
  id: string;
  startAt: string;
  status: string;
  billingStatus: string;
  service: { name: string };
  customer: { fullName: string; phoneE164: string };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PendenciasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchPending() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }
      const data = await authApiFetch<Appointment[]>('/appointments/pending', token);
      setAppointments(data);
    } catch {
      setError('Erro ao carregar pendências.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function handleBilling(id: string, billingStatus: string) {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await authApiFetch(`/appointments/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'set_billing', billingStatus }),
      });
      await fetchPending();
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.body?.message ?? 'Erro ao atualizar.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Pendências de pagamento
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
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

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]*)/);
  return match?.[1] ?? null;
}
