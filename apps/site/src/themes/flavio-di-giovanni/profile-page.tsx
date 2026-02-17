import {
  Activity,
  ArrowRight,
  Building2,
  ChevronDown,
  Dumbbell,
  Eye,
  Facebook,
  FlaskConical,
  Instagram,
  Linkedin,
  Monitor,
  Ruler,
  ScanLine,
  Search,
  TreePine,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Oswald, Inter } from 'next/font/google';
import type { ProfilePageProps } from '../types';
import { FlavioHeader } from './header';

const oswald = Oswald({ variable: '--font-fdg-display', subsets: ['latin'] });
const inter = Inter({ variable: '--font-fdg-sans', subsets: ['latin'] });

const IMG = '/themes/flavio-di-giovanni';

// Abreviações para cores
const C = {
  primary: '#2563eb',
  dark: '#1e3a8a',
  accent: '#fbbf24',
  bg: '#0a0a0a',
  text: '#ffffff',
} as const;

function headingFont(): React.CSSProperties {
  return { fontFamily: 'var(--font-fdg-display), Arial, sans-serif' };
}

export default function FlavioProfilePage({ tenant, services }: ProfilePageProps) {
  const agendarHref = services.length === 1
    ? `/agendar?serviceId=${services[0].id}`
    : '/agendar';

  return (
    <div
      className={`${oswald.variable} ${inter.variable} min-h-screen flex flex-col`}
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: 'var(--font-fdg-sans), Arial, sans-serif',
      }}
    >
      <FlavioHeader />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #020617 0%, #0a1a3a 20%, #0f3577 45%, #1e3a8a 60%, #1a3070 75%, #0a1628 100%)',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_65%_60%,rgba(37,99,235,0.35)_0%,rgba(30,58,138,0.15)_40%,transparent_70%)] hidden lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_80%,rgba(37,99,235,0.25)_0%,transparent_60%)] lg:hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_60%_55%,rgba(59,130,246,0.2)_0%,transparent_60%)] hidden lg:block" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-0 sm:pt-28 lg:pt-20 lg:pb-0">
            <div className="lg:grid lg:grid-cols-[5fr_7fr] lg:gap-12 lg:items-end">
              {/* Texto */}
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up lg:pt-16 xl:pt-24 lg:pb-16 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-medium text-white backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white" />
                  </span>
                  VAGAS LIMITADAS
                </div>

                <h1
                  className="text-[2.5rem] font-bold uppercase leading-[0.9] tracking-tighter sm:text-5xl md:text-6xl lg:text-5xl xl:text-7xl text-white"
                  style={headingFont()}
                >
                  MAIS FORTE <br />
                  A CADA DIA <br />
                  COMIGO
                </h1>

                <p className="max-w-md mx-auto lg:mx-0 text-sm text-white/60 sm:text-base lg:text-lg font-light tracking-wide leading-relaxed">
                  Treinamento personalizado projetado para ajudar você a
                  construir força, manter a consistência e alcançar resultados
                  duradouros.
                </p>

                <div className="flex flex-wrap gap-4 pt-1 sm:pt-2">
                  <Link
                    href={agendarHref}
                    className="group inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base font-bold text-black transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: C.accent }}
                  >
                    COMECE AGORA
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Imagem */}
              <div className="relative mt-6 sm:mt-10 lg:mt-0 flex justify-center">
                <div className="absolute top-8 right-0 z-20 hidden lg:flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 shadow-lg">
                  <div className="flex -space-x-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">A</div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">B</div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">C</div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">500+ Alunos</span>
                </div>

                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                    1000+ Sessões Concluídas
                  </span>
                </div>

                <Image
                  src={`${IMG}/flavio-pose.png`}
                  alt="Flávio Di Giovanni"
                  width={600}
                  height={750}
                  className="object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.3)] w-[75%] max-w-[320px] sm:max-w-[400px] lg:w-full lg:max-w-none"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section id="sobre" className="bg-black py-16 sm:py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative aspect-[3/4] w-full max-w-xs sm:max-w-md overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 group">
                  <div className="absolute inset-0 mix-blend-overlay group-hover:opacity-0 transition-opacity" style={{ backgroundColor: `${C.primary}33` }} />
                  <div className="absolute -inset-4 border-2 z-20 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" style={{ borderColor: `${C.primary}4D` }} />
                  <Image
                    src={`${IMG}/flavio-certificados.jpg`}
                    alt="Flávio Di Giovanni"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <h2
                  className="mb-6 sm:mb-8 text-3xl text-center lg:text-left font-bold uppercase leading-none tracking-tighter text-white sm:text-5xl lg:text-7xl"
                  style={headingFont()}
                >
                  Mais de 20 anos <br />
                  <span style={{ color: C.primary }}>transformando</span> <br />
                  vidas.
                </h2>

                <p className="text-base sm:text-lg text-gray-400 font-light leading-relaxed mb-6">
                  Bem-vindo a uma jornada de saúde e bem-estar guiada por mais de
                  duas décadas de expertise. Como profissional, minha trajetória é
                  marcada por uma sólida formação acadêmica e uma paixão incessante
                  por transformar vidas.
                </p>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                  Minha abordagem adaptativa garante que todos possam acessar os
                  benefícios de um estilo de vida ativo — com ciência, dedicação e
                  acompanhamento personalizado.
                </p>

                <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6 border-t border-white/10 pt-6 sm:pt-8">
                  {[
                    { value: '20+', label: 'Anos de\nExperiência' },
                    { value: '500+', label: 'Alunos\nSatisfeitos' },
                    { value: '1000+', label: 'Sessões\nConcluídas' },
                  ].map((s) => (
                    <div key={s.value}>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" style={{ color: C.primary }}>{s.value}</h3>
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 whitespace-pre-line">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Onde atuo */}
            <div className="mt-12 sm:mt-20">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 sm:mb-6">
                Onde atuo
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Dumbbell, title: 'Academias', desc: 'Treinos presenciais com acompanhamento completo' },
                  { icon: Building2, title: 'Empresas', desc: 'Programas de saúde e qualidade de vida corporativa' },
                  { icon: TreePine, title: 'Ar Livre', desc: 'Treinamento funcional em espaços ao ar livre' },
                  { icon: Monitor, title: 'Online', desc: 'Consultoria virtual para qualquer lugar do mundo' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all"
                    style={{ ['--tw-border-opacity' as string]: undefined }}
                  >
                    <item.icon className="h-6 w-6 mb-3" style={{ color: C.primary }} />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1" style={headingFont()}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TECHNOLOGY (BODYGEE) ─── */}
        <section id="tecnologia" className="py-16 sm:py-32 relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${C.primary}0D` }} />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
              <ScanLine className="h-4 w-4" />
              TECNOLOGIA EXCLUSIVA
            </div>

            <div className="grid gap-16 lg:grid-cols-2 lg:items-center text-left">
              <div>
                <h2
                  className="mb-6 sm:mb-8 text-3xl text-center lg:text-left font-bold uppercase tracking-tighter text-white sm:text-5xl lg:text-7xl"
                  style={headingFont()}
                >
                  ESCANEAMENTO <br />
                  <span style={{ color: C.primary }}>CORPORAL 3D</span>
                </h2>

                <p className="text-base sm:text-lg text-gray-400 font-light leading-relaxed mb-6 sm:mb-8 max-w-lg">
                  Utilizamos o <strong className="text-white font-semibold">Bodygee</strong>, líder europeu em escaneamento 3D, para acompanhar sua evolução com precisão científica. Esqueça fitas métricas e fotos — visualize sua transformação em um avatar 3D fotorrealista.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
                  {[
                    { icon: Activity, title: 'Composição Corporal', desc: 'Gordura corporal, IMC, RCQ e TMR com métodos cientificamente comprovados' },
                    { icon: Eye, title: 'Avatar 3D Realista', desc: 'Mais de 100.000 pontos de dados geram seu avatar fotorrealista' },
                    { icon: Ruler, title: 'Precisão de 0,5cm', desc: 'Monitoramento visual e numérico com altíssima precisão' },
                    { icon: ScanLine, title: 'Rápido e Seguro', desc: 'Escaneamento não invasivo em segundos com sensores de profundidade' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors">
                      <item.icon className="h-6 w-6 mb-3" style={{ color: C.primary }} />
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1" style={headingFont()}>{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href={agendarHref}
                    className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-105"
                    style={{ backgroundColor: C.primary }}
                  >
                    AGENDAR MEU SCAN <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <a
                    href="https://www.bodygee.com/br/fitness"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 font-medium transition-colors"
                    style={{ ['--hover-color' as string]: C.primary }}
                  >
                    Saiba mais sobre o Bodygee <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Bodygee images */}
              <div className="relative flex flex-col gap-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <Image
                    src={`${IMG}/bodygee-scan.webp`}
                    alt="Escaneamento corporal 3D com Bodygee"
                    width={600}
                    height={400}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Powered by</p>
                    <p className="text-lg font-bold text-white tracking-wider">BODYGEE</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { src: 'bodygee-app.webp', alt: 'Aplicativo Bodygee', label: 'App Cliente' },
                    { src: 'bodygee-body-scan.webp', alt: 'Avatar 3D fotorrealista', label: 'Avatar 3D' },
                    { src: 'bodygee-ipad.webp', alt: 'Dashboard de análise corporal', label: 'Dashboard' },
                  ].map((img) => (
                    <div key={img.src} className="relative overflow-hidden rounded-2xl border border-white/10 aspect-square group">
                      <Image src={`${IMG}/${img.src}`} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white">{img.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <Image src={`${IMG}/bodygee-app.webp`} alt="Aplicativo Bodygee" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wide">App do Cliente</p>
                    <p className="text-xs text-gray-400 mt-0.5">Acompanhe seu progresso em 3D pelo celular, a qualquer hora</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: '500k+', label: 'Scans realizados' },
                    { value: '0,5cm', label: 'Precisão' },
                    { value: '100k+', label: 'Pontos de dados' },
                  ].map((s) => (
                    <div key={s.value}>
                      <p className="text-2xl font-bold" style={{ color: C.primary }}>{s.value}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROTOCOLO ─── */}
        <section id="protocolo" className="bg-black py-16 sm:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: `${C.primary}0D` }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${C.primary}0D` }} />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 sm:mb-20">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-medium" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
                <FlaskConical className="h-4 w-4" />
                PROTOCOLO EXCLUSIVO
              </div>
              <h2
                className="text-3xl font-bold uppercase leading-[0.9] tracking-tighter text-white sm:text-5xl lg:text-7xl mb-4"
                style={headingFont()}
              >
                FIRMEZA E <br />
                <span style={{ color: C.primary }}>REMODELAÇÃO</span> CORPORAL
              </h2>
              <p className="mx-auto max-w-2xl text-sm sm:text-lg text-gray-400 font-light leading-relaxed">
                Avaliação 3D + Bioestimulação + Ativação Muscular. Nosso protocolo
                começa com tecnologia e estratégia.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent to-transparent hidden lg:block" style={{ ['--tw-gradient-via' as string]: `${C.primary}4D` }} />

              {/* Step 1 */}
              <div className="relative grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 mb-12 sm:mb-20 items-center">
                <div className="lg:text-right order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium mb-4" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
                    1º PASSO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4" style={headingFont()}>
                    Avaliação 3D Corporal
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed mb-6">
                    Realizamos o escaneamento corporal completo através da
                    Bioimpedância 3D Bodygee, criando uma base comparativa precisa
                    para medir seus resultados.
                  </p>
                  <ul className="space-y-2">
                    {['Composição corporal', 'Percentual de gordura', 'Massa muscular', 'Distribuição corporal', 'Estrutura postural'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-300 lg:justify-end">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: C.primary }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border" style={{ borderColor: `${C.primary}33`, background: `linear-gradient(to bottom right, ${C.primary}33, ${C.primary}0D)` }}>
                    <Search className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: C.primary }} />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 mb-12 sm:mb-20 items-center">
                <div className="flex justify-center lg:justify-end">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border" style={{ borderColor: `${C.primary}33`, background: `linear-gradient(to bottom right, ${C.primary}33, ${C.primary}0D)` }}>
                    <FlaskConical className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: C.primary }} />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium mb-4" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
                    2º PASSO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4" style={headingFont()}>
                    Bioestimulação de Colágeno
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                    Aplicação do Radiesse por profissional habilitado, estimulando a
                    produção natural de colágeno e melhorando a firmeza da pele.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 mb-12 sm:mb-20 items-center">
                <div className="lg:text-right order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium mb-4" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
                    3º PASSO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4" style={headingFont()}>
                    Ativação Muscular Profunda
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed mb-6">
                    Após o intervalo seguro, iniciamos as sessões de
                    Eletroestimulação Muscular da Onnafit, conduzidas por Educador
                    Físico.
                  </p>
                  <ul className="space-y-2">
                    {['Tonificação muscular', 'Aceleração metabólica', 'Sustentação tecidual', 'Remodelação corporal'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-300 lg:justify-end">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: C.accent }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border" style={{ borderColor: `${C.accent}33`, background: `linear-gradient(to bottom right, ${C.accent}33, ${C.accent}0D)` }}>
                    <Zap className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: C.accent }} />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
                <div className="flex justify-center lg:justify-end">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border" style={{ borderColor: `${C.primary}33`, background: `linear-gradient(to bottom right, ${C.primary}33, ${C.primary}0D)` }}>
                    <Activity className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: C.primary }} />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium mb-4" style={{ borderColor: `${C.primary}4D`, backgroundColor: `${C.primary}1A`, color: '#60a5fa' }}>
                    4º PASSO
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mb-4" style={headingFont()}>
                    Reavaliação 3D
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed mb-6">
                    Ao final da última sessão, realizamos um novo escaneamento
                    corporal 3D para comparar a evolução completa.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Antes x Depois', 'Evolução corporal', 'Mudanças estruturais', 'Impacto do protocolo'].map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-gray-300 text-center">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 sm:mt-24 text-center">
              <p className="text-sm sm:text-base text-gray-500 uppercase tracking-widest mb-6">
                Resultado mensurável, visual e objetivo
              </p>
              <Link
                href={agendarHref}
                className="group inline-flex items-center justify-center rounded-full px-8 py-4 text-sm sm:text-base font-bold uppercase tracking-widest text-white transition-all hover:scale-105"
                style={{ backgroundColor: C.primary }}
              >
                QUERO O PROTOCOLO
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PLANOS ─── */}
        <section id="planos" className="py-16 sm:py-32 relative" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-12 sm:mb-20 text-center">
              <h2 className="text-3xl font-bold uppercase tracking-tighter sm:text-5xl lg:text-7xl" style={headingFont()}>
                PLANOS FEITOS <br /> PARA <span style={{ color: C.primary }}>SEUS OBJETIVOS</span>
              </h2>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
              {/* Plan 1 */}
              <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-black p-8 transition-all hover:-translate-y-2">
                <div className="mb-4 font-bold tracking-widest uppercase text-sm" style={{ color: C.primary }}>Iniciante</div>
                <h3 className="mb-6 text-4xl font-bold uppercase tracking-tight text-white" style={headingFont()}>STARTER PLAN</h3>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$150</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  {['Treino Mensal', 'Acesso ao App', 'Suporte Básico', 'Análise de Execução'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.primary }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={agendarHref}
                  className="block w-full rounded-full border border-white/20 bg-transparent py-4 text-center text-sm font-bold uppercase tracking-widest transition-all hover:text-white"
                  style={{ ['--hover-bg' as string]: C.primary }}
                >
                  ESCOLHER PLANO
                </Link>
              </div>

              {/* Plan 2 - Featured */}
              <div className="group relative flex flex-col rounded-3xl border-2 p-8 lg:-mt-8 lg:mb-8 transition-all" style={{ borderColor: C.primary, backgroundColor: `${C.primary}0D` }}>
                <div className="absolute top-0 right-0 rounded-bl-2xl rounded-tr-3xl text-white text-xs font-bold px-4 py-1.5 uppercase tracking-widest" style={{ backgroundColor: C.primary }}>
                  Recomendado
                </div>
                <div className="mb-4 font-bold tracking-widest uppercase text-sm" style={{ color: C.primary }}>Intermediário</div>
                <h3 className="mb-6 text-4xl font-bold uppercase tracking-tight text-white" style={headingFont()}>PRO PLAN</h3>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-bold" style={{ color: C.primary }}>R$250</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  {['Treino Quinzenal', 'Feedback de Vídeo', 'Suporte WhatsApp', 'Guia Nutricional', 'Ajustes de Carga'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white font-medium">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.accent }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={agendarHref}
                  className="block w-full rounded-full py-4 text-center text-sm font-bold uppercase text-white tracking-widest transition-all"
                  style={{ backgroundColor: C.primary, boxShadow: `0 10px 15px -3px ${C.primary}40` }}
                >
                  COMEÇAR AGORA
                </Link>
              </div>

              {/* Plan 3 */}
              <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-black p-8 transition-all hover:-translate-y-2">
                <div className="mb-4 font-bold tracking-widest uppercase text-sm" style={{ color: C.primary }}>Avançado</div>
                <h3 className="mb-6 text-4xl font-bold uppercase tracking-tight text-white" style={headingFont()}>MAX PLAN</h3>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$400</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <ul className="mb-12 space-y-4 flex-1">
                  {['Personalização Total', 'Periodização Anual', 'Calls Mensais', 'Suporte VIP 24/7', 'Protocolos Avançados'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.primary }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={agendarHref}
                  className="block w-full rounded-full border border-white/20 bg-transparent py-4 text-center text-sm font-bold uppercase tracking-widest transition-all hover:text-white"
                >
                  FALAR COMIGO
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DEPOIMENTOS ─── */}
        <section id="testimonials" className="py-16 sm:py-32 text-white relative" style={{ backgroundColor: C.primary }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
            <div className="mb-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black/20 text-6xl font-serif leading-none italic">
                &ldquo;
              </div>
            </div>

            <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto text-left">
              {[
                { quote: 'O treino do Flávio me levou além dos meus limites. Me sinto mais forte, saudável e confiante do que nunca!', name: 'Jessica Moreira', role: 'Aluna de Hipertrofia', initial: 'J' },
                { quote: 'Em 6 meses perdi 18kg e ganhei massa muscular. A metodologia do Flávio é simplesmente diferente de tudo que já tentei.', name: 'Ricardo Almeida', role: 'Aluno de Emagrecimento', initial: 'R' },
                { quote: 'Depois dos 50 anos achei que seria impossível voltar a treinar. O Flávio adaptou tudo para mim e hoje me sinto 20 anos mais jovem.', name: 'Marta Fernandes', role: 'Aluna de Qualidade de Vida', initial: 'M' },
                { quote: 'O acompanhamento online é incrível. Mesmo morando fora do Brasil, consigo manter a consistência com os treinos e feedbacks semanais.', name: 'Bruno Costa', role: 'Aluno Online', initial: 'B' },
                { quote: 'O escaneamento 3D do Bodygee foi um divisor de águas. Ver minha evolução no avatar me motiva muito mais do que qualquer foto.', name: 'Camila Santos', role: 'Aluna de Recomposição', initial: 'C' },
                { quote: 'Contratei o Flávio para o programa corporativo da minha empresa. A produtividade e o bem-estar da equipe melhoraram visivelmente.', name: 'André Peixoto', role: 'Programa Corporativo', initial: 'A' },
              ].map((t) => (
                <figure
                  key={t.name}
                  className="flex flex-col justify-between rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/15 transition-colors"
                >
                  <blockquote className="text-base font-medium leading-relaxed mb-8 opacity-95">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-sm font-bold">
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wider">{t.name}</div>
                      <div className="text-xs opacity-70 uppercase tracking-widest">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="py-16 sm:py-32" style={{ backgroundColor: C.bg }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter text-white mb-10 sm:mb-20 text-center lg:text-left"
              style={headingFont()}
            >
              FAQ
            </h2>

            <div className="grid lg:grid-cols-2 gap-10 sm:gap-16">
              <div>
                <p className="text-xl text-gray-400 mb-8 max-w-md">
                  Dúvidas comuns sobre como funciona a consultoria, pagamentos e
                  suporte.
                </p>
                <Link
                  href={agendarHref}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: C.primary }}
                >
                  Agende Agora <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="divide-y divide-white/10 border-t border-white/10">
                {[
                  { q: '1. POSSO CANCELAR A QUALQUER MOMENTO?', a: 'Sim, nossos planos mensais não possuem fidelidade. Para planos trimestrais, consulte as condições.' },
                  { q: '2. QUANTO TEMPO DURAM AS SESSÕES?' },
                  { q: '3. PRECISO DE EQUIPAMENTOS?' },
                  { q: '4. COMO ACOMPANHO MEU PROGRESSO?' },
                  { q: '5. A CONSULTORIA É APENAS ONLINE?' },
                ].map((faq) => (
                  <div key={faq.q} className="group py-6">
                    <h3 className="flex items-center justify-between text-xl font-bold uppercase text-white cursor-pointer transition-colors" style={headingFont()}>
                      <span className="text-sm sm:text-xl">{faq.q}</span>
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform group-hover:rotate-180" />
                    </h3>
                    {faq.a && (
                      <p className="mt-4 text-gray-400 hidden group-hover:block">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-black py-12 sm:py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-8 sm:gap-12 md:flex-row">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Image src={`${IMG}/flavio-logo.png`} alt="Flávio Di Giovanni Logo" width={200} height={80} />
            <p className="mt-2 text-sm text-gray-500 max-w-xs text-center md:text-left">
              Transformando vidas através do movimento inteligente e da ciência
              aplicada.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-6">
            <div className="flex gap-6 text-sm font-medium text-gray-400">
              <Link href="#sobre" className="hover:text-white transition-colors">Sobre</Link>
              <Link href="#planos" className="hover:text-white transition-colors">Planos</Link>
              <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/flaviodigiovannipersonal" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/flaviopizzadigiovanni" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/flavio-di-giovanni-9b388546" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Flávio Di Giovanni. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
