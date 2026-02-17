'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { authApiFetch } from '@/lib/auth-api';

interface CustomerPlan {
  id: string;
  type: string;
  sessionsTotal: number;
  sessionsUsed: number;
  validUntil: string;
  status: string;
}

interface CustomerAppointment {
  id: string;
  startAt: string;
  status: string;
  billingStatus: string;
  service: { name: string };
}

interface CustomerDetail {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  notes: string | null;
  plans: CustomerPlan[];
  appointments: CustomerAppointment[];
}

const statusLabels: Record<string, string> = {
  BOOKED: 'Confirmado',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  DONE: 'Realizado',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ClienteDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const token = getToken();
        if (!token) {
          setError('Sessão expirada.');
          setLoading(false);
          return;
        }
        const data = await authApiFetch<CustomerDetail>(
          `/customers/${params.id}`,
          token,
        );
        setCustomer(data);
      } catch {
        setError('Erro ao carregar cliente.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  if (loading) return <p className="text-sm text-zinc-500">Carregando...</p>;
  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  if (!customer) return null;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {customer.fullName}
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {customer.phoneE164}
        {customer.email && ` · ${customer.email}`}
      </p>

      {customer.notes && (
        <p className="mb-6 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {customer.notes}
        </p>
      )}

      {/* Plans */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Planos
        </h2>
        {customer.plans.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum plano.
          </p>
        ) : (
          <div className="space-y-2">
            {customer.plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {plan.type} — {plan.sessionsUsed}/{plan.sessionsTotal}{' '}
                    sessões
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      plan.status === 'ACTIVE'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Válido até{' '}
                  {new Date(plan.validUntil).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Appointments */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Agendamentos recentes
        </h2>
        {customer.appointments.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum agendamento.
          </p>
        ) : (
          <div className="space-y-2">
            {customer.appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {apt.service.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(apt.startAt)}
                  </p>
                </div>
                <span className="text-xs font-medium text-zinc-500">
                  {statusLabels[apt.status] ?? apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]*)/);
  return match?.[1] ?? null;
}
