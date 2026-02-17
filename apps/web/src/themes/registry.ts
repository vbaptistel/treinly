import type { ComponentType } from 'react';

type PageKey = 'profile' | 'agendar';

type ThemeModuleLoader = () => Promise<{ default: ComponentType<any> }>;

const themeRegistry: Record<string, Partial<Record<PageKey, ThemeModuleLoader>>> = {
  default: {
    profile: () => import('./default/profile-page'),
    agendar: () => import('./default/agendar-page'),
  },
  'flavio-di-giovanni': {
    profile: () => import('./flavio-di-giovanni/profile-page'),
    agendar: () => import('./flavio-di-giovanni/agendar-page'),
  },
};

/**
 * Carrega o componente de página para um tema.
 *
 * Resolve o themeId efetivo:
 *   1. pageThemes[pageKey] se definido (override por página)
 *   2. themeId do tenant
 *   3. fallback para "default"
 */
export async function loadThemePage(
  themeId: string,
  pageKey: PageKey,
  pageThemes?: Record<string, string> | null,
): Promise<ComponentType<any>> {
  const effectiveThemeId = pageThemes?.[pageKey] ?? themeId;

  // Tentar tema efetivo
  const themePages = themeRegistry[effectiveThemeId];
  if (themePages?.[pageKey]) {
    const mod = await themePages[pageKey]();
    return mod.default;
  }

  // Fallback para default
  const defaultPages = themeRegistry['default'];
  if (defaultPages?.[pageKey]) {
    const mod = await defaultPages[pageKey]();
    return mod.default;
  }

  throw new Error(`Página "${pageKey}" não encontrada em nenhum tema`);
}
