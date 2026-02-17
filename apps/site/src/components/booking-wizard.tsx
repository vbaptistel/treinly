'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getAvailability,
  createAppointment,
  type BookingResult,
} from '@/app/actions/public';

// --- Types ---

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  slotMinutes: number;
  minNoticeMinutes: number;
  priceCents: number | null;
}

// --- Zod schema for step 3 (client data) ---

const ClientDataSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ClientData = z.infer<typeof ClientDataSchema>;

// --- Helpers ---

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

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getNextDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

// --- Component ---

interface BookingWizardProps {
  slug: string;
  services: Service[];
  initialServiceId?: string;
}

export function BookingWizard({ slug, services, initialServiceId }: BookingWizardProps) {
  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [selectedService, setSelectedService] = useState<Service | null>(
    initialServiceId ? services.find((s) => s.id === initialServiceId) ?? null : null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const form = useForm<ClientData>({
    resolver: zodResolver(ClientDataSchema),
    defaultValues: { fullName: '', phone: '', email: '', notes: '' },
  });

  // Step 1: Select service
  function handleSelectService(service: Service) {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);
    setStep(2);
  }

  // Step 2: Select date and slot (via server action — evita CORS)
  async function handleSelectDate(date: string) {
    if (!selectedService) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);
    setLoadingSlots(true);
    const result = await getAvailability(slug, selectedService.id, date);
    setLoadingSlots(false);
    if ('error' in result) {
      setSlots([]);
      setError(result.error);
      return;
    }
    setSlots(result.data.slots);
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    setError(null);
    setStep(3);
  }

  // Step 3: Submit (via server action — evita CORS)
  async function onSubmit(data: ClientData) {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    const result = await createAppointment(slug, {
      serviceId: selectedService.id,
      startAt: selectedSlot,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      notes: data.notes || undefined,
    });
    setSubmitting(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setResult(result.data);
    setStep(4);
  }

  function goBack() {
    setError(null);
    if (step === 3) {
      setSelectedSlot(null);
      setStep(2);
    } else if (step === 2) {
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      setSlots([]);
      setStep(1);
    }
  }

  // --- Step indicators ---
  const stepLabels = ['Serviço', 'Horário', 'Dados'];

  // --- Success state ---
  if (step === 4 && result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
          Agendamento confirmado!
        </h2>
        <p className="mt-3 text-green-700 dark:text-green-300">
          {selectedService?.name} — {selectedSlot && formatSlotTime(selectedSlot)}
        </p>
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          {result.billingStatus === 'COVERED'
            ? 'Sessão debitada do seu plano.'
            : 'Pagamento pendente — acerte com o profissional.'}
        </p>
        <a
          href={result.manageUrl}
          className="mt-6 inline-block rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
        >
          Gerenciar agendamento
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i + 1 <= step
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                i + 1 <= step
                  ? 'font-medium text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div className="mx-1 h-px w-6 bg-zinc-300 dark:bg-zinc-600" />
            )}
          </div>
        ))}
      </div>

      {/* Back button */}
      {step > 1 && step < 4 && (
        <button
          type="button"
          onClick={goBack}
          className="mb-4 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          &larr; Voltar
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => handleSelectService(service)}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {service.name}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDuration(service.durationMinutes)}
                    {service.priceCents != null && ` · ${formatPrice(service.priceCents)}`}
                  </span>
                </div>
                <span className="text-zinc-400">&rarr;</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Step 2: Date + Slot */}
      {step === 2 && selectedService && (
        <div>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedService.name} · {formatDuration(selectedService.durationMinutes)}
          </p>

          {/* Date selector */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Escolha uma data
            </h3>
            <div className="flex flex-wrap gap-2">
              {getNextDays(14).map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedDate === date
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500'
                  }`}
                >
                  {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          {selectedDate && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Horários disponíveis — {formatDate(selectedDate)}
              </h3>
              {loadingSlots ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Carregando horários...
                </p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Nenhum horário disponível nesta data.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-50 dark:hover:bg-zinc-50 dark:hover:text-zinc-900"
                    >
                      {formatSlotTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Client data */}
      {step === 3 && selectedService && selectedSlot && (
        <div>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedService.name} · {selectedDate && formatDate(selectedDate)} ·{' '}
            {formatSlotTime(selectedSlot)}
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Nome completo *
              </label>
              <input
                id="fullName"
                type="text"
                {...form.register('fullName')}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                placeholder="João da Silva"
              />
              {form.formState.errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Telefone *
              </label>
              <input
                id="phone"
                type="tel"
                {...form.register('phone')}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                placeholder="(11) 99999-9999"
              />
              {form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                {...form.register('email')}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                placeholder="joao@email.com"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Observações
              </label>
              <textarea
                id="notes"
                {...form.register('notes')}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                placeholder="Objetivo, restrições, etc."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {submitting ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
