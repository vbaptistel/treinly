'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { authApiFetch, ApiError } from '@/lib/auth-api';
import { getToken } from '@/lib/auth';

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  billingStatus: string;
  service: { name: string };
  customer: { fullName: string; phoneE164: string };
}

const statusLabels: Record<string, string> = {
  BOOKED: 'Confirmado',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  DONE: 'Realizado',
};

const statusColors: Record<string, string> = {
  BOOKED: 'text-green-600 dark:text-green-400',
  CANCELED: 'text-red-600 dark:text-red-400',
  NO_SHOW: 'text-amber-600 dark:text-amber-400',
  DONE: 'text-blue-600 dark:text-blue-400',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getWeekRange(offset: number): { from: string; to: string; label: string } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + offset * 7 - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const label = `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    label,
  };
}

export default function AgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const range = getWeekRange(weekOffset);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }
      const data = await authApiFetch<Appointment[]>(
        `/appointments?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
        token,
      );
      setAppointments(data);
    } catch (err) {
      setError('Erro ao carregar agenda.');
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function handleAction(id: string, action: string, billingStatus?: string) {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      await authApiFetch(`/appointments/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ action, billingStatus }),
      });
      await fetchAppointments();
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.body?.message ?? 'Erro ao executar ação.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  // Group by date
  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const dateKey = new Date(apt.startAt).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    (acc[dateKey] ??= []).push(apt);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Agenda
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600"
          >
            &larr;
          </button>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {range.label}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600"
          >
            &rarr;
          </button>
        </div>
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
      ) : appointments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum agendamento neste período.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, apts]) => (
            <div key={dateLabel}>
              <h2 className="mb-3 text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                {dateLabel}
              </h2>
              <div className="space-y-2">
                {apts.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                        {formatTime(apt.startAt)}
                      </span>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {apt.customer.fullName}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {apt.service.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${statusColors[apt.status] ?? ''}`}>
                        {statusLabels[apt.status] ?? apt.status}
                      </span>
                      {apt.status === 'BOOKED' && (
                        <div className="flex gap-1">
                          <button
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt.id, 'done')}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                            title="Marcar como realizado"
                          >
                            Done
                          </button>
                          <button
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt.id, 'no_show')}
                            className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300"
                            title="No-show"
                          >
                            NS
                          </button>
                          <button
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt.id, 'cancel')}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                            title="Cancelar"
                          >
                            X
                          </button>
                        </div>
                      )}
                      {apt.billingStatus === 'PENDING' && apt.status !== 'CANCELED' && (
                        <div className="flex gap-1">
                          <button
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt.id, 'set_billing', 'PAID_MANUAL')}
                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                            title="Marcar como pago"
                          >
                            Pago
                          </button>
                          <button
                            disabled={actionLoading === apt.id}
                            onClick={() => handleAction(apt.id, 'set_billing', 'WAIVED')}
                            className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                            title="Dispensar cobrança"
                          >
                            Disp.
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
