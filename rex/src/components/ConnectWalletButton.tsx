import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Copy, Check, Link2, LogOut, Wallet } from 'lucide-react';
import { SolanaLogo } from './SolanaLogo';
import { formatSolAmount, useSolBalance } from '../hooks/useSolBalance';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';
import {
  buildRaidLink,
  RAID_EARNINGS_PERIODS,
  raidEarningsForPeriod,
  type RaidEarningsPeriod,
} from '../utils/scoutReferral';

const STORAGE_KEY = 'rex-connected-wallet';

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
};

function getProvider(): SolanaProvider | null {
  if (typeof window === 'undefined') return null;
  const solana = (window as unknown as { solana?: SolanaProvider }).solana;
  return solana ?? null;
}

function shorten(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function isDemoWallet(address: string | null | undefined): boolean {
  return Boolean(address && /Wallet111111111$/i.test(address));
}

function readStored(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (isDemoWallet(value)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function writeStored(address: string | null) {
  try {
    if (address) localStorage.setItem(STORAGE_KEY, address);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type WalletContextValue = {
  address: string | null;
  connected: boolean;
  busy: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) setAddress(stored);

    const provider = getProvider();
    if (!provider) return;

    const sync = () => {
      const next = provider.publicKey?.toString() ?? readStored();
      setAddress(next);
      writeStored(next);
    };
    sync();
    provider.on?.('connect', sync);
    provider.on?.('disconnect', () => {
      setAddress(null);
      writeStored(null);
    });
    return () => {
      provider.off?.('connect', sync);
      provider.off?.('disconnect', () => undefined);
    };
  }, []);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const provider = getProvider();
      if (provider?.connect) {
        const res = await provider.connect();
        const next = res.publicKey.toString();
        setAddress(next);
        writeStored(next);
        return next;
      }
      const demo = `${Math.random().toString(36).slice(2, 10)}Wallet111111111`;
      setAddress(demo);
      writeStored(null);
      return demo;
    } catch {
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      const provider = getProvider();
      await provider?.disconnect?.();
    } catch {
      // ignore
    }
    setAddress(null);
    writeStored(null);
    setBusy(false);
  }, []);

  const value = useMemo(
    () => ({
      address,
      connected: Boolean(address),
      busy,
      connect,
      disconnect,
    }),
    [address, busy, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/** Shared wallet connection — votes require `connected`. */
export function useConnectedWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useConnectedWallet must be used within WalletProvider');
  }
  return ctx;
}

/** Axiom-style header pill: wallet + SOL logo + balance, dropdown for details. */
export function ConnectWalletButton({
  className = '',
  alwaysLabel = false,
}: {
  className?: string;
  alwaysLabel?: boolean;
}) {
  const { address, busy, connect, disconnect } = useConnectedWallet();
  const { sol, loading, refresh } = useSolBalance(address);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRaid, setCopiedRaid] = useState(false);
  const [period, setPeriod] = useState<RaidEarningsPeriod>('7d');
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
  const raidLink = address ? buildRaidLink(origin, address) : null;
  const periodEarnings = useMemo(
    () =>
      address ? raidEarningsForPeriod(address, period) : { earnedSol: 0, volumeUsd: 0, clicks: 0 },
    [address, period],
  );
  const balanceLabel = loading && sol == null ? '…' : formatSolAmount(sol ?? 0, 2);
  const labelClass = alwaysLabel ? 'inline' : 'hidden sm:inline';
  const raidRate = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

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

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const copyRaidLink = async () => {
    if (!raidLink) return;
    try {
      await navigator.clipboard.writeText(raidLink);
      setCopiedRaid(true);
      window.setTimeout(() => setCopiedRaid(false), 1600);
    } catch {
      /* ignore */
    }
  };

  if (!address) {
    return (
      <button
        type="button"
        onClick={() => void connect()}
        disabled={busy}
        title="Connect wallet"
        className={`inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 text-xs font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white disabled:opacity-50 sm:px-3 ${className}`}
      >
        <Wallet className="h-3.5 w-3.5 shrink-0" />
        <span className={labelClass}>{busy ? 'Connecting…' : 'Connect wallet'}</span>
      </button>
    );
  }

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="dialog"
            aria-label="Wallet"
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed z-[200] w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#14161f] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/[0.07] px-3.5 py-3">
              <p className="text-[11px] font-medium text-white/40">Total value</p>
              <p className="mt-0.5 font-serif text-xl font-bold tabular-nums text-white">
                {loading && sol == null ? '…' : `${formatSolAmount(sol ?? 0, 4)} SOL`}
              </p>
              <button
                type="button"
                onClick={() => void copyAddress()}
                className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-white/45 transition hover:text-white/80"
              >
                {copied ? <Check className="h-3 w-3 text-[#d5ff69]" /> : <Copy className="h-3 w-3" />}
                {shorten(address)}
              </button>
            </div>

            <div className="space-y-2.5 border-b border-white/[0.07] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-white/50">Raid Earnings</p>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    Raid rate <span className="font-semibold text-[#d5ff69]">{raidRate}</span> of
                    swap volume
                  </p>
                </div>
                <div className="inline-flex shrink-0 rounded-lg border border-white/[0.08] bg-black/25 p-0.5">
                  {RAID_EARNINGS_PERIODS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPeriod(p.id)}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition ${
                        period === p.id
                          ? 'bg-[#c8ff3d] text-[#090b14]'
                          : 'text-white/45 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <SolanaLogo className="h-4 w-4" />
                    <span className="text-[11px] font-medium text-white/50">SOL</span>
                  </div>
                  <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-white">
                    {loading && sol == null ? '…' : formatSolAmount(sol ?? 0, 4)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                  <p className="text-[11px] font-medium text-white/50">Earned · {period}</p>
                  <p className="mt-1.5 flex items-center gap-1 font-mono text-sm font-semibold tabular-nums text-[#d5ff69]">
                    <SolanaLogo className="h-3.5 w-3.5" />
                    {formatSolAmount(periodEarnings.earnedSol, 3)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-white/35">
                Vol ${periodEarnings.volumeUsd.toLocaleString()} · {periodEarnings.clicks} link
                copies this window
              </p>
            </div>

            <div className="border-b border-white/[0.07] px-3 py-2.5">
              <p className="text-[11px] font-medium text-white/50">Raid link</p>
              <p
                className="mt-1 truncate font-mono text-[11px] text-white/45"
                title={raidLink ?? undefined}
              >
                {raidLink}
              </p>
              <button
                type="button"
                onClick={() => void copyRaidLink()}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/[0.1] px-3 py-2 text-[12px] font-bold text-[#d5ff69] transition hover:bg-[#c8ff3d]/[0.18]"
              >
                {copiedRaid ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                {copiedRaid ? 'Raid link copied' : 'Copy raid link'}
              </button>
            </div>

            <div className="flex gap-2 p-3">
              <button
                type="button"
                onClick={() => refresh()}
                className="flex-1 rounded-xl bg-[#c8ff3d] px-3 py-2.5 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void disconnect();
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[12px] font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect
              </button>
            </div>
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
        disabled={busy}
        title={`${shorten(address)} · ${balanceLabel} SOL`}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#12141c] px-2 pl-2.5 text-white transition hover:border-white/20 hover:bg-[#181b26] disabled:opacity-50"
      >
        <Wallet className="h-3.5 w-3.5 shrink-0 text-white/55" strokeWidth={2} />
        <span className="mx-0.5 h-3.5 w-px bg-white/[0.12]" aria-hidden />
        <SolanaLogo className="h-4 w-4 shrink-0" />
        <span className="min-w-[1.25rem] pr-0.5 text-left font-mono text-[12px] font-semibold tabular-nums text-white">
          {balanceLabel}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-white/40 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {menu}
    </div>
  );
}
