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
  HelpCircle,
  Mail,
  X,
  Menu,
  Star,
  UserRound,
} from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { AuthButton } from './AuthButton';
import { useAuth } from './AuthProvider';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: Star, end: false },
  { to: '/fees', label: 'Fees', icon: Percent, end: false },
  { to: '/marketing-wallet', label: 'Marketing wallet', icon: Wallet, end: false },
  { to: '/advertise', label: 'Advertise', icon: Zap, end: false },
  { to: '/launch', label: 'Launch', icon: Rocket, end: false },
  { to: '/faq', label: 'FAQ', icon: HelpCircle, end: false },
  { to: '/contact', label: 'Contact', icon: Mail, end: false },
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
  const { count } = useWatchlist();
  const { signedIn } = useAuth();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {signedIn ? (
        <NavLink
          to="/launch?dashboard=1"
          end={false}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
            }`
          }
        >
          <UserRound className="h-4 w-4 shrink-0" />
          <span className="flex-1">Dashboard</span>
        </NavLink>
      ) : null}
      {NAV.map((item) => {
        const Icon = item.icon;
        const showCount = item.to === '/watchlist' && count > 0;
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
            <Icon className={`h-4 w-4 shrink-0 ${item.to === '/watchlist' && count > 0 ? 'fill-current' : ''}`} />
            <span className="flex-1">{item.label}</span>
            {showCount ? (
              <span className="rounded-full bg-[#c8ff3d]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#d5ff69]">
                {count}
              </span>
            ) : null}
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
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-[56] flex w-[min(14rem,100%)] flex-col border-l border-white/[0.08] bg-[#05070d]">
            <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
              <NavLink
                to="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 font-serif text-base font-bold tracking-tight text-white"
              >
                CTOgo
                <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  beta
                </span>
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
            <div className="mt-auto border-t border-white/[0.06] p-3">
              <AuthButton variant="sidebar" />
            </div>
          </aside>
        </>
      ) : null}
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
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/5 ${className}`.trim()}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

/** Simple layout: right drawer + main content. */
export function AppShell({
  children,
  showTrigger = true,
}: {
  children: ReactNode;
  showTrigger?: boolean;
}) {
  return (
    <AppSidebarProvider>
      <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
        <AppSidebar showTrigger={showTrigger} />
        <div>{children}</div>
      </div>
    </AppSidebarProvider>
  );
}
