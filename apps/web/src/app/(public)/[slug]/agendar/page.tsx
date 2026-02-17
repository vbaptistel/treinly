import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { BookingWizard } from './booking-wizard';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const data = await apiFetch<TenantPublicData>(`/public/${slug}`);
    return {
      title: `Agendar — ${data.tenant.name}`,
      description: `Agende seu horário com ${data.tenant.name}`,
    };
  } catch {
    return { title: 'Profissional não encontrado' };
  }
}

export default async function AgendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { slug } = await params;
  const { serviceId } = await searchParams;

  let data: TenantPublicData;
  try {
    data = await apiFetch<TenantPublicData>(`/public/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {data.tenant.name}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Agendar horário
        </p>
      </header>
      <BookingWizard
        slug={slug}
        services={data.services}
        initialServiceId={serviceId}
      />
    </div>
  );
}
