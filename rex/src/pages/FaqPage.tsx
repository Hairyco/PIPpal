import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { FAQ_SECTIONS } from '../data/faq';

export function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(FAQ_SECTIONS[0]?.items[0]?.id ?? null);

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">FAQ</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Common questions</h1>
        <p className="mt-2 text-sm text-white/50">
          How takeovers, marketing wallets, and fees work on CTOgo.
        </p>

        {FAQ_SECTIONS.map((section) => (
          <section key={section.id} className="mt-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
              {section.label}
            </h2>
            <div className="mt-2 space-y-2">
              {section.items.map((item) => {
                const open = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-white/85">{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open ? (
                      <p className="border-t border-white/[0.06] px-4 py-3 text-[13px] leading-relaxed text-white/55">
                        {item.answer}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/contact"
            className="rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Still stuck? Contact us
          </Link>
          <Link
            to="/fees"
            className="rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Fee guidelines
          </Link>
          <Link
            to="/marketing-wallet"
            className="rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Marketing wallet
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
