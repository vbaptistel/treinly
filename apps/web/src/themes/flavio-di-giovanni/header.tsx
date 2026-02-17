'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const IMG = '/themes/flavio-di-giovanni';

const navLinks = [
  { name: 'Sobre', href: '#sobre' },
  { name: 'Tecnologia', href: '#tecnologia' },
  { name: 'Protocolo', href: '#protocolo' },
  { name: 'Planos', href: '#planos' },
  { name: 'Depoimentos', href: '#testimonials' },
];

export function FlavioHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src={`${IMG}/flavio-logo.png`}
            alt="Flavio Di Giovanni"
            width={120}
            height={60}
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 rounded-full bg-black/90 backdrop-blur-md px-10 py-3.5 border border-white/5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Link
            href="/agendar"
            className="px-7 py-2.5 rounded-full border border-white/30 text-white/80 text-xs font-medium uppercase tracking-[0.15em] transition-all hover:bg-white/10 hover:border-white/50 hover:text-white"
          >
            Agendar
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-widest text-gray-300 hover:text-[#2563eb] transition-colors py-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/agendar"
            className="w-full text-center py-3 rounded-full border border-[#2563eb] text-[#2563eb] font-semibold uppercase text-sm tracking-wider hover:bg-[#2563eb] hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agendar
          </Link>
        </div>
      )}
    </header>
  );
}
