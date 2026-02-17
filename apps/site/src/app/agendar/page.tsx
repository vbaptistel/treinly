import { apiFetch } from '@/lib/api';
import { getTenantSlug } from '@/lib/get-tenant-slug';
import { loadThemePage } from '@/themes/registry';
import { notFound } from 'next/navigation';

interface TenantPublicData {
  tenant: {
    name: string;
    slug: string;
    timezone: string;
    rules: { cancel_before_hours: number; };
    themeId: string;
    pageThemes: Record<string, string> | null;
    branding: Record<string, string> | null;
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

export async function generateMetadata() {
  const slug = await getTenantSlug();
  if (!slug) return { title: 'Profissional não encontrado' };

  try {
    const data = await apiFetch<TenantPublicData>(`/public/${slug}`);
    const themeId = data.tenant.themeId ?? 'default';
    return {
      title: `Agendar — ${data.tenant.name}`,
      description: `Agende seu horário com ${data.tenant.name}`,
      ...(themeId !== 'default' && {
        icons: { icon: `/themes/${themeId}/favicon.ico` },
      }),
    };
  } catch {
    return { title: 'Profissional não encontrado' };
  }
}

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string; }>;
}) {
  const slug = await getTenantSlug();
  if (!slug) notFound();

  const { serviceId } = await searchParams;

  let data: TenantPublicData;
  try {
    data = await apiFetch<TenantPublicData>(`/public/${slug}`);
  } catch {
    notFound();
  }

  const AgendarThemePage = await loadThemePage(
    data.tenant.themeId,
    'agendar',
    data.tenant.pageThemes,
  );

  return (
    <AgendarThemePage
      tenant={data.tenant}
      services={data.services}
      slug={slug}
      initialServiceId={serviceId}
    />
  );
}
