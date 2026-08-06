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
import { Bell, BellOff, CheckCheck, Link2, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useConnectedWallet } from './ConnectWalletButton';
import { hasUserCtoLaunch, loadUserCtoLaunch } from '../utils/userCtoLaunch';
import { formatSolAmount } from '../hooks/useSolBalance';
import {
  areNotificationsMuted,
  formatRaidNoticeTime,
  listRaidPayoutNotices,
  markRaidNoticeRead,
  NOTIFICATIONS_PREFS_CHANGED,
  RAID_ALERTS_CHANGED,
  setNotificationsMuted,
} from '../utils/raidEarningsAlerts';
import { RAID_EARNING_EVENT } from '../utils/scoutReferral';
import { unlockRaidAudio } from '../utils/raidBell';

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

/** Only real, actionable alerts for this session — never seed demo spam. */
function buildActiveNotifications(wallet: string | null): AppNotification[] {
  const items: AppNotification[] = [];

  const payouts = listRaidPayoutNotices(wallet).slice(0, 12);
  for (const p of payouts) {
    const tickerBit = p.ticker ? ` on $${p.ticker}` : '';
    items.push({
      id: p.id,
      kind: 'earnings',
      title: `Raid fee +${formatSolAmount(p.amountSol, 4)} SOL`,
      body: `Instant SOL from a trade through your link${tickerBit}.`,
      time: formatRaidNoticeTime(p.at),
      href: undefined,
    });
  }

  const launch = loadUserCtoLaunch();
  if (!launch) {
    if (items.length === 0) {
      items.push({
        id: 'setup-coin',
        kind: 'promo',
        title: 'Set up your first CTO',
        body: 'Launch or list a coin to unlock your dashboard, raid links, and marketing wallet.',
        time: 'Now',
        href: '/launch',
      });
    }
    return items;
  }

  const ticker = launch.ticker;
  if (!launch.marketingAttached && launch.mode === 'add') {
    items.push({
      id: `mkt-attach-${ticker}`,
      kind: 'wallet',
      title: 'Attach marketing wallet',
      body: `Add the Auto Marketing Wallet on $${ticker} to fund your spend roadmap.`,
      time: 'Active',
      href: '/launch?dashboard=1',
    });
  }

  items.push({
    id: `raid-share-${ticker}`,
    kind: 'raid_link',
    title: `Share your $${ticker} raid link`,
    body: 'Copy your raid link from the wallet menu or coin Affiliate tab to earn on attributed buys.',
    time: 'Active',
    href: `/coin/${encodeURIComponent(ticker)}`,
  });

  return items;
}

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
  const { signedIn } = useAuth();
  const { address } = useConnectedWallet();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [tick, setTick] = useState(0);
  const [muted, setMuted] = useState(() =>
    typeof window !== 'undefined' ? areNotificationsMuted() : false,
  );
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setSeen(readSeenIds());
    setMuted(areNotificationsMuted());
  }, []);

  useEffect(() => {
    if (!signedIn) setOpen(false);
  }, [signedIn]);

  useEffect(() => {
    if (!open) return;
    setTick((n) => n + 1);
  }, [open]);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    const onPrefs = () => setMuted(areNotificationsMuted());
    window.addEventListener(RAID_EARNING_EVENT, refresh);
    window.addEventListener(RAID_ALERTS_CHANGED, refresh);
    window.addEventListener(NOTIFICATIONS_PREFS_CHANGED, onPrefs);
    return () => {
      window.removeEventListener(RAID_EARNING_EVENT, refresh);
      window.removeEventListener(RAID_ALERTS_CHANGED, refresh);
      window.removeEventListener(NOTIFICATIONS_PREFS_CHANGED, onPrefs);
    };
  }, []);

  const notifications = useMemo(() => {
    void tick;
    void hasUserCtoLaunch();
    return buildActiveNotifications(signedIn ? address : null);
  }, [tick, signedIn, address]);

  const unreadCount = useMemo(() => {
    if (muted) return 0;
    const payoutUnread = listRaidPayoutNotices(signedIn ? address : null).filter(
      (n) => !n.read,
    ).length;
    const staticUnread = notifications.filter(
      (n) => !n.id.startsWith('raid-') && !seen.has(n.id),
    ).length;
    return payoutUnread + staticUnread;
  }, [notifications, seen, signedIn, address, tick, muted]);

  const toggleMute = () => {
    const next = !muted;
    setNotificationsMuted(next);
    setMuted(next);
  };

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
    const next = new Set(notifications.map((n) => n.id));
    setSeen(next);
    writeSeenIds(next);
    for (const n of notifications) {
      if (n.id.startsWith('raid-')) markRaidNoticeRead(n.id);
    }
  };

  const markOneRead = (id: string) => {
    if (id.startsWith('raid-')) {
      markRaidNoticeRead(id);
      setTick((n) => n + 1);
      return;
    }
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeSeenIds(next);
      return next;
    });
  };

  const isUnread = (id: string) => {
    if (id.startsWith('raid-')) {
      return listRaidPayoutNotices(address).some((n) => n.id === id && !n.read);
    }
    return !seen.has(id);
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
                <p className="text-[10px] text-white/40">
                  {muted ? 'Muted · alerts paused' : 'Raid fees & active alerts'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition hover:bg-white/5 ${
                    muted ? 'text-[#d5ff69]' : 'text-white/50 hover:text-white'
                  }`}
                  aria-pressed={muted}
                  title={muted ? 'Unmute notifications' : 'Mute notifications'}
                >
                  {muted ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                  {muted ? 'Unmute' : 'Mute'}
                </button>
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
            </div>

            {notifications.length === 0 ? (
              <div className="px-3.5 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-white/25" />
                <p className="mt-2 text-sm font-semibold text-white/70">No active notifications</p>
                <p className="mt-1 text-[11px] text-white/40">
                  Raid earnings and wallet fills will show up here.
                </p>
              </div>
            ) : (
              <ul className="max-h-[min(70vh,24rem)] overflow-y-auto overscroll-contain">
                {notifications.map((item) => {
                  const unread = isUnread(item.id);
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
            )}
          </div>,
          document.body,
        )
      : null;

  if (!signedIn) return null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          unlockRaidAudio();
          setOpen((v) => !v);
        }}
        className="relative grid h-9 w-9 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white sm:h-10 sm:w-10"
        aria-label={
          muted
            ? 'Notifications muted'
            : unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
        }
        title={muted ? 'Notifications muted' : 'Notifications'}
      >
        {muted ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {!muted && unreadCount > 0 ? (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c8ff3d] px-1 text-[9px] font-bold leading-none text-[#090b14]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
      {menu}
    </div>
  );
}
