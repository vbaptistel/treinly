'use server';

import { apiFetch, ApiError } from '@/lib/api';

// --- Tipos de retorno ---

export type GetAvailabilityResult =
  | { data: { date: string; slots: string[] } }
  | { error: string };

export interface BookingPayload {
  serviceId: string;
  startAt: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface BookingResult {
  appointmentId: string;
  billingStatus: string;
  manageToken: string;
  manageUrl: string;
}

export type CreateAppointmentResult =
  | { data: BookingResult }
  | { error: string; status?: number };

export type CancelAppointmentResult = { ok: true } | { error: string; status?: number };

// --- Actions (chamadas à API pelo servidor, evitando CORS no client) ---

export async function getAvailability(
  slug: string,
  serviceId: string,
  date: string,
): Promise<GetAvailabilityResult> {
  try {
    const data = await apiFetch<{ date: string; slots: string[] }>(
      `/public/${slug}/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`,
    );
    return { data };
  } catch {
    return { error: 'Erro ao carregar horários disponíveis.' };
  }
}

export async function createAppointment(
  slug: string,
  payload: BookingPayload,
): Promise<CreateAppointmentResult> {
  try {
    const data = await apiFetch<BookingResult>(`/public/${slug}/appointments`, {
      method: 'POST',
      body: JSON.stringify({
        serviceId: payload.serviceId,
        startAt: payload.startAt,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email || undefined,
        notes: payload.notes || undefined,
      }),
    });
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        return {
          error:
            err.body?.message ??
            'Horário indisponível ou limite de agendamento atingido.',
          status: err.status,
        };
      }
      if (err.status === 400) {
        return { error: 'Dados inválidos. Verifique os campos e tente novamente.', status: err.status };
      }
      return { error: 'Erro ao criar agendamento. Tente novamente.', status: err.status };
    }
    return { error: 'Erro de conexão. Tente novamente.' };
  }
}

export async function cancelAppointment(
  token: string,
): Promise<CancelAppointmentResult> {
  try {
    await apiFetch(`/public/appointments/manage/${token}/cancel`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return {
        error: err.body?.message ?? 'Prazo para cancelamento expirado.',
        status: err.status,
      };
    }
    return { error: 'Erro ao cancelar. Tente novamente.' };
  }
}
