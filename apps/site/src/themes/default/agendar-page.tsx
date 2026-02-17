import { BookingWizard } from '@/components/booking-wizard';
import type { AgendarPageProps } from '../types';
import type { PublicBranding } from '@treinly/validation';

function brandingStyles(branding: PublicBranding | null | undefined): React.CSSProperties {
  if (!branding) return {};
  return {
    '--color-primary': branding.primaryColor,
    '--color-secondary': branding.secondaryColor,
    '--color-bg': branding.backgroundColor,
    '--color-text': branding.textColor,
  } as React.CSSProperties;
}

export default function DefaultAgendarPage({
  tenant,
  services,
  slug,
  initialServiceId,
}: AgendarPageProps) {
  const branding = tenant.branding;
  const hasBranding = branding && Object.keys(branding).length > 0;

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
        ...(branding?.fontBody ? { fontFamily: branding.fontBody } : {}),
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
        <h1
          className="text-3xl font-bold text-zinc-900 dark:text-zinc-50"
          style={{
            ...(branding?.fontHeading ? { fontFamily: branding.fontHeading } : {}),
            ...(hasBranding && branding?.textColor ? { color: 'var(--color-text)' } : {}),
          }}
        >
          {tenant.name}
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Agendar horário
        </p>
      </header>
      <BookingWizard
        slug={slug}
        services={services}
        initialServiceId={initialServiceId}
      />
    </div>
  );
}
