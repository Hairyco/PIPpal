import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useAppSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useAppSidebar must be used within AppSidebarProvider');
  }
  return ctx;
}

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((prev) => !prev),
    }),
    [open],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

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

/** Right-side nav drawer — opened from the original header menu button. */
export function AppSidebar({ showTrigger = false }: { showTrigger?: boolean }) {
  const { open, setOpen, toggle } = useAppSidebar();

  return (
    <>
      {showTrigger ? (
        <button
          type="button"
          onClick={toggle}
          className="fixed right-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-lg border border-white/[0.1] bg-black/80 text-white/70 backdrop-blur"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/60"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-[56] flex w-56 flex-col border-l border-white/[0.08] bg-[#05070d] transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="font-serif text-base font-bold tracking-tight text-white"
          >
            CTOgo
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-white/45 hover:text-white"
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

/** Header control that opens the right nav drawer. */
export function AppSidebarMenuButton({ className = '' }: { className?: string }) {
  const { toggle } = useAppSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ||
        'grid h-10 w-10 place-items-center rounded-lg text-white/60 hover:bg-white/5'
      }
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

/** Simple layout: right drawer + main content. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppSidebarProvider>
      <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
        <AppSidebar showTrigger />
        <div>{children}</div>
      </div>
    </AppSidebarProvider>
  );
}
