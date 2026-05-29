'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

const navigation = [
  { name: 'Projects', href: '/projects' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-400',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-sm border-b border-light-gray'
          : 'bg-transparent'
      )}
    >
      <nav className="container-site">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-charcoal hover:text-accent-red transition-colors duration-300"
          >
            SHB Studio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-accent link-underline"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span
                className={clsx(
                  'block h-px bg-charcoal transition-all duration-300',
                  isMobileMenuOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={clsx(
                  'block h-px bg-charcoal transition-all duration-300',
                  isMobileMenuOpen && 'opacity-0'
                )}
              />
              <span
                className={clsx(
                  'block h-px bg-charcoal transition-all duration-300',
                  isMobileMenuOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 top-20 bg-cream z-40 transition-all duration-400',
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <nav className="container-site py-12">
          <div className="flex flex-col space-y-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  'font-serif text-display-sm text-charcoal hover:text-accent-red transition-colors duration-300',
                  isMobileMenuOpen && 'animate-fade-in',
                  `animation-delay-${(index + 1) * 100}`
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
