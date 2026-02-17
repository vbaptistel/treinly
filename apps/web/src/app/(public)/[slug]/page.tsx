import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface TenantPublicData {
  tenant: {
    name: string;
    slug: string;
    timezone: string;
    rules: { cancel_before_hours: number };
  };
  services: {
    id: string;
    name: string;
    durationMinutes: number;
    slotMinutes: number;
    minNoticeMinutes: number;
    priceCents: number | null;
  }[];
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const data = await apiFetch<TenantPublicData>(`/public/${slug}`);
    return {
      title: `${data.tenant.name} — Agendar`,
      description: `Agende seu horário com ${data.tenant.name}`,
    };
  } catch {
    return { title: 'Profissional não encontrado' };
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: TenantPublicData;
  try {
    data = await apiFetch<TenantPublicData>(`/public/${slug}`);
  } catch {
    notFound();
  }

  const { tenant, services } = data;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {tenant.name}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Escolha um serviço para agendar
        </p>
      </header>

      {services.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Nenhum serviço disponível no momento.
        </p>
      ) : (
        <ul className="space-y-4">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-5 dark:border-zinc-700"
            >
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {service.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDuration(service.durationMinutes)}
                  {service.priceCents != null && (
                    <> · {formatPrice(service.priceCents)}</>
                  )}
                </p>
              </div>
              <Link
                href={`/${slug}/agendar?serviceId=${service.id}`}
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Agendar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
