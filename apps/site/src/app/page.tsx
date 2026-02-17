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
    return {
      title: `${data.tenant.name}`,
      description: `Agende seu horário com ${data.tenant.name}`,
      ...(slug !== 'default' && {
        icons: [{ url: `/themes/${slug}/favicon.ico`, rel: 'icon' }],
      }),
    };
  } catch {
    return { title: 'Profissional não encontrado' };
  }
}

export default async function PublicProfilePage() {
  const slug = await getTenantSlug();
  if (!slug) notFound();

  let data: TenantPublicData;
  try {
    data = await apiFetch<TenantPublicData>(`/public/${slug}`);
  } catch {
    notFound();
  }

  const ProfilePage = await loadThemePage(
    data.tenant.themeId,
    'profile',
    data.tenant.pageThemes,
  );

  return <ProfilePage tenant={data.tenant} services={data.services} />;
}
