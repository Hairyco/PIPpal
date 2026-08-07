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
  LayoutDashboard,
} from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { AuthButton } from './AuthButton';

const NAV = [
  { to: '/', label: 'Discover', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: false },
  { to: '/watchlist', label: 'Watchlist', icon: Star, end: false },
  { to: '/fees', label: 'Fees', icon: Percent, end: false },
  { to: '/marketing-wallet', label: 'Marketing wallet', icon: Wallet, end: false },
  { to: '/advertise', label: 'Advertise', icon: Zap, end: false },
  { to: '/launch', label: 'Launch', icon: Rocket, end: false },
  { to: '/home', label: 'Classic', icon: Home, end: false },
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
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const showCount = item.to === '/watchlist' && count > 0;
        return (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-full px-3 py-2.5 text-[13px] font-semibold transition ${
                isActive
                  ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                  : 'text-white/55 hover:bg-[#1c1c1e] hover:text-white'
              }`
            }
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${item.to === '/watchlist' && count > 0 ? 'fill-current' : ''}`}
            />
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

/** Nav drawer — left from Discover hex, right from Launch menu. */
export function AppSidebar({
  showTrigger = false,
  side = 'right',
}: {
  showTrigger?: boolean;
  side?: 'left' | 'right';
}) {
  const { open, setOpen, toggle } = useAppSidebar();
  const fromLeft = side === 'left';

  return (
    <>
      {showTrigger ? (
        <button
          type="button"
          onClick={toggle}
          className={`fixed top-3 z-[60] grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-black/80 text-white/70 backdrop-blur ${
            fromLeft ? 'left-3' : 'right-3'
          }`}
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
          <aside
            className={`fixed inset-y-0 z-[56] flex w-[min(16rem,100%)] flex-col border-white/[0.08] bg-[#121214] ${
              fromLeft ? 'left-0 border-r' : 'right-0 border-l'
            }`}
          >
            <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-4">
              <NavLink
                to="/"
                onClick={() => setOpen(false)}
                className="inline-flex flex-col"
              >
                <span className="text-[15px] font-bold tracking-tight text-white">CTOgo</span>
                <span className="text-[10px] font-medium text-white/40">
                  The Home of Community Takeovers
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/45 hover:bg-[#1c1c1e] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <div className="mt-auto border-t border-white/[0.08] p-3">
              <AuthButton variant="sidebar" />
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

/** Header control that opens the nav drawer. */
export function AppSidebarMenuButton({
  className = '',
  icon = 'menu',
}: {
  className?: string;
  icon?: 'menu' | 'hexagon';
}) {
  const { toggle } = useAppSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid h-9 w-9 shrink-0 place-items-center text-white/90 transition hover:text-white ${className}`.trim()}
      aria-label="Open menu"
    >
      {icon === 'hexagon' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[22px] w-[22px]"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <path
            d="M12 2.5 20.5 7.25v9.5L12 21.5 3.5 16.75v-9.5L12 2.5Z"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </button>
  );
}

/** Simple layout: drawer + main content. */
export function AppShell({
  children,
  showTrigger = true,
}: {
  children: ReactNode;
  showTrigger?: boolean;
}) {
  return (
    <AppSidebarProvider>
      <div className="page-shell theme-dark min-h-screen bg-black text-white">
        <AppSidebar showTrigger={showTrigger} />
        <div>{children}</div>
      </div>
    </AppSidebarProvider>
  );
}
