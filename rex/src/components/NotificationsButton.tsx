import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, Link2, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';

const READ_KEY = 'ctogo-notifications-read';

type NotificationKind = 'raid_link' | 'earnings' | 'wallet' | 'promo';

type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  href?: string;
};

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'raid-share-mpeg',
    kind: 'raid_link',
    title: 'Share your raid link',
    body: 'Drop your $MPEG raid link in Telegram — 0.50% SOL on attributed CTOgo buys.',
    time: '12m',
    href: '/coin/MPEG',
  },
  {
    id: 'earn-7d',
    kind: 'earnings',
    title: 'Raid earnings update',
    body: 'You earned 0.084 SOL this week from referred swaps. Keep sharing your raid link.',
    time: '1h',
  },
  {
    id: 'raid-reminder-lmars',
    kind: 'raid_link',
    title: 'Raid link reminder',
    body: '$LMARS is trending. Copy your raid link from the wallet menu or coin Affiliate tab.',
    time: '3h',
    href: '/coin/LMARS',
  },
  {
    id: 'earn-click',
    kind: 'earnings',
    title: 'New attributed volume',
    body: 'A buy through your raid link filled raid commission into your SOL balance.',
    time: '5h',
  },
  {
    id: 'wallet-fill',
    kind: 'wallet',
    title: 'Marketing wallet filling',
    body: `${formatBpsPercent(SCOUT_FEE_ENGINE.marketingBps)} of CTOgo-routed volume is funding your spend roadmap.`,
    time: 'Yesterday',
    href: '/marketing-wallet',
  },
  {
    id: 'promo-list',
    kind: 'promo',
    title: 'Unlock Raid Rewards',
    body: 'List a CTO to unlock built-in utility — Auto Marketing Wallet + Raid Rewards.',
    time: '2d',
    href: '/launch?mode=list',
  },
];

function readSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

function KindIcon({ kind }: { kind: NotificationKind }) {
  const className = 'h-3.5 w-3.5';
  if (kind === 'raid_link') return <Link2 className={className} />;
  if (kind === 'earnings') return <Sparkles className={className} />;
  if (kind === 'wallet') return <Wallet className={className} />;
  return <Bell className={className} />;
}

export function NotificationsButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setSeen(readSeenIds());
  }, []);

  const unreadCount = useMemo(
    () => DEMO_NOTIFICATIONS.filter((n) => !seen.has(n.id)).length,
    [seen],
  );

  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    window.addEventListener('resize', updateMenuPos);
    window.addEventListener('scroll', updateMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateMenuPos);
      window.removeEventListener('scroll', updateMenuPos, true);
    };
  }, [open, updateMenuPos]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markAllRead = () => {
    const next = new Set(DEMO_NOTIFICATIONS.map((n) => n.id));
    setSeen(next);
    writeSeenIds(next);
  };

  const markOneRead = (id: string) => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeSeenIds(next);
      return next;
    });
  };

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-label="Notifications"
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed z-[200] w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#14161f] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-3.5 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-[10px] text-white/40">Raid links · earnings · wallet</p>
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-white/50 transition hover:bg-white/5 hover:text-[#d5ff69]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>

            <ul className="max-h-[min(70vh,24rem)] overflow-y-auto overscroll-contain">
              {DEMO_NOTIFICATIONS.map((item) => {
                const unread = !seen.has(item.id);
                const content = (
                  <>
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                        unread
                          ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                          : 'bg-white/[0.05] text-white/40'
                      }`}
                    >
                      <KindIcon kind={item.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[12px] font-semibold ${
                            unread ? 'text-white' : 'text-white/70'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="shrink-0 text-[10px] text-white/35">{item.time}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-white/45">
                        {item.body}
                      </span>
                    </span>
                    {unread ? (
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8ff3d]"
                        aria-hidden
                      />
                    ) : (
                      <span className="w-1.5 shrink-0" aria-hidden />
                    )}
                  </>
                );

                return (
                  <li key={item.id} className="border-b border-white/[0.05] last:border-0">
                    {item.href ? (
                      <Link
                        to={item.href}
                        onClick={() => {
                          markOneRead(item.id);
                          setOpen(false);
                        }}
                        className="flex items-start gap-2.5 px-3.5 py-3 transition hover:bg-white/[0.04]"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markOneRead(item.id)}
                        className="flex w-full items-start gap-2.5 px-3.5 py-3 text-left transition hover:bg-white/[0.04]"
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#c8ff3d] px-1 text-[9px] font-bold leading-none text-[#090b14]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
      {menu}
    </div>
  );
}
