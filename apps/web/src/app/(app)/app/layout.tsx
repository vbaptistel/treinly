import Link from 'next/link';

const navItems = [
  { href: '/app', label: 'Agenda' },
  { href: '/app/pendencias', label: 'Pendências' },
  { href: '/app/clientes', label: 'Clientes' },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Treinly
          </span>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
