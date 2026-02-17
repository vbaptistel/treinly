import Link from 'next/link';
import type { ProfilePageProps } from '../types';
import type { PublicBranding } from '@treinly/validation';

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

function brandingStyles(branding: PublicBranding | null | undefined): React.CSSProperties {
  if (!branding) return {};
  return {
    '--color-primary': branding.primaryColor,
    '--color-secondary': branding.secondaryColor,
    '--color-bg': branding.backgroundColor,
    '--color-text': branding.textColor,
  } as React.CSSProperties;
}

function fontStyles(branding: PublicBranding | null | undefined): {
  heading?: string;
  body?: string;
} {
  if (!branding) return {};
  return {
    heading: branding.fontHeading,
    body: branding.fontBody,
  };
}

export default function DefaultProfilePage({ tenant, services }: ProfilePageProps) {
  const branding = tenant.branding;
  const hasBranding = branding && Object.keys(branding).length > 0;
  const fonts = fontStyles(branding);

  return (
    <div
      className="mx-auto min-h-screen max-w-2xl px-4 py-12"
      style={{
        ...brandingStyles(branding),
        ...(hasBranding && branding?.backgroundColor
          ? { backgroundColor: 'var(--color-bg)' }
          : {}),
        ...(hasBranding && branding?.textColor
          ? { color: 'var(--color-text)' }
          : {}),
        ...(fonts.body ? { fontFamily: fonts.body } : {}),
      }}
    >
      <header className="mb-10 text-center">
        {branding?.logoUrl && (
          <img
            src={branding.logoUrl}
            alt={`Logo ${tenant.name}`}
            className="mx-auto mb-4 h-16 w-auto"
          />
        )}
        {branding?.heroImageUrl && (
          <img
            src={branding.heroImageUrl}
            alt={tenant.name}
            className="mb-6 w-full rounded-lg object-cover"
            style={{ maxHeight: '240px' }}
          />
        )}
        <h1
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-50"
          style={{
            ...(fonts.heading ? { fontFamily: fonts.heading } : {}),
            ...(hasBranding && branding?.textColor ? { color: 'var(--color-text)' } : {}),
          }}
        >
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
                href={`/agendar?serviceId=${service.id}`}
                className={
                  hasBranding && branding?.primaryColor
                    ? 'rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors'
                    : 'rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300'
                }
                style={
                  hasBranding && branding?.primaryColor
                    ? { backgroundColor: 'var(--color-primary)' }
                    : undefined
                }
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
