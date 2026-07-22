import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Percent,
  Wallet,
  Zap,
  Rocket,
  X,
  Menu,
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/fees', label: 'Fees', icon: Percent, end: false },
  { to: '/marketing-wallet', label: 'Marketing wallet', icon: Wallet, end: false },
  { to: '/services', label: 'Services', icon: Zap, end: false },
  { to: '/launch', label: 'Launch', icon: Rocket, end: false },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                  : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-lg border border-white/[0.1] bg-black/80 text-white/70 backdrop-blur md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/60 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[56] flex w-56 flex-col border-r border-white/[0.08] bg-[#05070d] transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="font-serif text-base font-bold tracking-tight text-white"
          >
            CTO
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-white/45 hover:text-white md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavItems onNavigate={() => setOpen(false)} />
        <p className="mt-auto border-t border-white/[0.06] p-4 text-[10px] leading-relaxed text-white/30">
          Fees · marketing wallet · services
        </p>
      </aside>
    </>
  );
}

/** Simple layout: sidebar + main content. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <AppSidebar />
      <div className="md:pl-56">{children}</div>
    </div>
  );
}
