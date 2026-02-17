import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { CancelButton } from './cancel-button';

interface AppointmentData {
  status: string;
  tenantSlug: string;
  themeId: string;
  serviceName: string;
  startAt: string;
  canCancel: boolean;
  cancelBeforeHours: number;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusLabels: Record<string, string> = {
  BOOKED: 'Confirmado',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  DONE: 'Realizado',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const data = await apiFetch<AppointmentData>(
      `/public/appointments/manage/${token}`,
    );
    return {
      title: `Agendamento — ${data.serviceName}`,
    };
  } catch {
    return { title: 'Agendamento não encontrado' };
  }
}

export default async function ManageAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let data: AppointmentData;
  try {
    data = await apiFetch<AppointmentData>(
      `/public/appointments/manage/${token}`,
    );
  } catch {
    notFound();
  }

  const isCanceled = data.status === 'CANCELED';

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Seu agendamento
        </h1>
      </header>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              Serviço
            </dt>
            <dd className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {data.serviceName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              Data e horário
            </dt>
            <dd className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {formatDateTime(data.startAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              Status
            </dt>
            <dd
              className={`text-lg font-medium ${
                isCanceled
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {statusLabels[data.status] ?? data.status}
            </dd>
          </div>
        </dl>
      </div>

      {data.status === 'BOOKED' && (
        <div className="mt-6">
          {data.canCancel ? (
            <CancelButton token={token} />
          ) : (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              O prazo para cancelamento ({data.cancelBeforeHours}h antes) já
              expirou.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
