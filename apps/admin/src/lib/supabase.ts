import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Placeholders permitem build sem .env; em runtime exige variáveis para uso real
export const supabase: SupabaseClient = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key');

export function requireSupabaseEnv(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local do admin',
    );
  }
}
