import type { PublicBranding } from '@treinly/validation';

export interface TenantThemeData {
  name: string;
  slug: string;
  timezone: string;
  rules: { cancel_before_hours: number };
  themeId: string;
  pageThemes: Record<string, string> | null;
  branding: PublicBranding | null;
}

export interface ServiceData {
  id: string;
  name: string;
  durationMinutes: number;
  slotMinutes: number;
  minNoticeMinutes: number;
  priceCents: number | null;
}

export interface ProfilePageProps {
  tenant: TenantThemeData;
  services: ServiceData[];
}

export interface AgendarPageProps {
  tenant: TenantThemeData;
  services: ServiceData[];
  slug: string;
  initialServiceId?: string;
}

export type ThemePageComponent<P = any> = React.ComponentType<P>;
