'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/auth';

type Status = 'loading' | 'set-password' | 'done' | 'error' | 'invalid-link';

export default function ConfirmarConvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseHashParams = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash?.replace(/^#/, '');
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');
    if (type === 'invite' && access_token && refresh_token) {
      return { access_token, refresh_token };
    }
    return null;
  }, []);

  useEffect(() => {
    const params = parseHashParams();
    if (!params) {
      setStatus('invalid-link');
      return;
    }
    supabase.auth
      .setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      })
      .then(({ data: { session }, error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          setStatus('error');
          return;
        }
        if (session) {
          setStatus('set-password');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [parseHashParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setSessionCookie(session.access_token);
    }
    setStatus('done');
    router.replace('/');
  };

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          Confirmando seu convite…
        </p>
      </div>
    );
  }

  if (status === 'invalid-link') {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Link inválido ou expirado
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use o link que foi enviado no e-mail de convite. Se o link expirou,
          peça um novo convite ao administrador.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-50"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Erro ao confirmar convite
        </h1>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-50"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  if (status === 'set-password') {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Definir sua senha
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Crie uma senha para acessar o painel nas próximas vezes.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              minLength={6}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              minLength={6}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Definir senha e entrar
          </button>
        </form>
      </div>
    );
  }

  return null;
}
