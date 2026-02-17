'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

interface CancelButtonProps {
  token: string;
}

export function CancelButton({ token }: CancelButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/public/appointments/manage/${token}/cancel`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.body?.message ?? 'Prazo para cancelamento expirado.');
      } else {
        setError('Erro ao cancelar. Tente novamente.');
      }
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-full border border-red-300 px-6 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
      >
        Cancelar agendamento
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Tem certeza que deseja cancelar?
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Não, manter
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
        >
          {submitting ? 'Cancelando...' : 'Sim, cancelar'}
        </button>
      </div>
    </div>
  );
}
