'use server';

import { getTokenFromCookies } from '@/lib/auth';
import { authApiFetch, ApiError } from '@/lib/auth-api';

export interface Appointment {
  id: string;
  startAt: string;
  endAt?: string;
  status: string;
  billingStatus: string;
  service: { name: string };
  customer: { fullName: string; phoneE164: string };
}

export type AppointmentsResult =
  | { data: Appointment[] }
  | { error: 'unauthorized' }
  | { error: 'api'; message: string; status?: number };

export type PatchAppointmentResult =
  | { data: void }
  | { error: 'unauthorized' }
  | { error: 'api'; message: string; status?: number };

export async function getAppointments(
  from: string,
  to: string,
): Promise<AppointmentsResult> {
  const token = await getTokenFromCookies();
  if (!token) return { error: 'unauthorized' };
  try {
    const data = await authApiFetch<Appointment[]>(
      `/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      token,
    );
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: 'api', message: err.body?.message ?? 'Erro ao carregar agenda.', status: err.status };
    }
    return { error: 'api', message: 'Erro ao carregar agenda.' };
  }
}

export async function getPendingAppointments(): Promise<AppointmentsResult> {
  const token = await getTokenFromCookies();
  if (!token) return { error: 'unauthorized' };
  try {
    const data = await authApiFetch<Appointment[]>('/appointments/pending', token);
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: 'api', message: err.body?.message ?? 'Erro ao carregar pendências.', status: err.status };
    }
    return { error: 'api', message: 'Erro ao carregar pendências.' };
  }
}

export async function patchAppointment(
  id: string,
  body: { action: string; billingStatus?: string },
): Promise<PatchAppointmentResult> {
  const token = await getTokenFromCookies();
  if (!token) return { error: 'unauthorized' };
  try {
    await authApiFetch(`/appointments/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return { data: undefined };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: 'api', message: err.body?.message ?? 'Erro ao executar ação.', status: err.status };
    }
    return { error: 'api', message: 'Erro ao executar ação.' };
  }
}
