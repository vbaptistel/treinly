import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Oswald, Inter } from 'next/font/google';
import { BookingWizard } from '@/components/booking-wizard';
import type { AgendarPageProps } from '../types';

const oswald = Oswald({ variable: '--font-fdg-display', subsets: ['latin'] });
const inter = Inter({ variable: '--font-fdg-sans', subsets: ['latin'] });

const IMG = '/themes/flavio-di-giovanni';

export default function FlavioAgendarPage({
  tenant,
  services,
  slug,
  initialServiceId,
}: AgendarPageProps) {
  return (
    <div
      className={`${oswald.variable} ${inter.variable} min-h-screen flex flex-col`}
      style={{
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily: 'var(--font-fdg-sans), Arial, sans-serif',
      }}
    >
      {/* Header simplificado */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <Link href={`/${slug}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Voltar</span>
          </Link>
          <Link href={`/${slug}`}>
            <Image
              src={`${IMG}/flavio-logo.png`}
              alt="Flávio Di Giovanni"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4">
          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter text-white mb-2 text-center"
            style={{ fontFamily: 'var(--font-fdg-display), Arial, sans-serif' }}
          >
            Agendar Horário
          </h1>
          <p className="text-sm text-gray-400 mb-8 text-center">
            Escolha o serviço, horário e preencha seus dados
          </p>

          <BookingWizard
            slug={slug}
            services={services}
            initialServiceId={initialServiceId}
          />
        </div>
      </main>
    </div>
  );
}
