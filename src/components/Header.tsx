import React, { useState, useEffect } from 'react';
import { HeartHandshake, Menu, X } from 'lucide-react';

interface HeaderProps {
  onGetStarted?: () => void;
  isLoggedIn?: boolean;
  onDashboard?: () => void;
}

export function Header({ onGetStarted, isLoggedIn, onDashboard }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Free tools', id: 'free-tools' },
    { label: 'Eligibility', id: 'eligibility-banner' },
    { label: 'Blog', id: 'blog' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200
        ${scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200'
          : 'bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/50'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-teal-700">
          <HeartHandshake className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">PIPpal</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={onDashboard}
              className="bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-800 transition-colors active:scale-95 shadow-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={onGetStarted}
                className="text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={onGetStarted}
                className="bg-teal-700 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-800 transition-colors active:scale-95 shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile: Get Started + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onGetStarted}
            className="bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-teal-800 transition-colors active:scale-95"
          >
            Get Started
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-600"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { isLoggedIn ? onDashboard?.() : onGetStarted?.(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Sign in'}
          </button>
        </div>
      )}
    </header>
  );
}