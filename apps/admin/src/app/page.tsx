import { redirect } from 'next/navigation';
import { getAppointments } from '@/app/actions/appointments';
import { AgendaContent } from './AgendaContent';

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

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekOffset = Number(params.week) || 0;
  const range = getWeekRange(weekOffset);

  const result = await getAppointments(range.from, range.to);

  if ('error' in result) {
    if (result.error === 'unauthorized') {
      redirect('/login');
    }
  }

  const initialData = 'data' in result ? result.data : null;
  const apiError =
    'error' in result && result.error === 'api'
      ? (result.message ?? 'Erro ao carregar agenda.')
      : null;

  return (
    <AgendaContent
      initialData={initialData}
      apiError={apiError}
      weekOffset={weekOffset}
      rangeLabel={range.label}
    />
  );
}
