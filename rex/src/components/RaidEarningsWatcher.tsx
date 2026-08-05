import { useEffect, useState } from 'react';
import { useConnectedWallet } from './ConnectWalletButton';
import { playRaidBell, unlockRaidAudio } from '../utils/raidBell';
import {
  pushRaidPayoutNotice,
  RAID_ALERTS_CHANGED,
} from '../utils/raidEarningsAlerts';
import {
  creditScoutEarningsDemo,
  RAID_EARNING_EVENT,
  type RaidEarningDetail,
} from '../utils/scoutReferral';
import { formatSolAmount } from '../hooks/useSolBalance';

const DEMO_SESSION_KEY = 'ctogo-raid-demo-session';

/**
 * Listens for raid fee credits: plays a bell, stores a notification, and shows a toast.
 * Also runs a light local demo credit loop until an on-chain indexer exists (free / local only).
 */
export function RaidEarningsWatcher() {
  const { address, connected } = useConnectedWallet();
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    const onGesture = () => unlockRaidAudio();
    window.addEventListener('pointerdown', onGesture, { once: true, capture: true });
    return () => window.removeEventListener('pointerdown', onGesture, true);
  }, []);

  useEffect(() => {
    const onEarn = (e: Event) => {
      const detail = (e as CustomEvent<RaidEarningDetail>).detail;
      if (!detail?.wallet || !(detail.amountSol > 0)) return;
      pushRaidPayoutNotice(detail);
      playRaidBell();
      const tickerBit = detail.ticker ? ` · $${detail.ticker}` : '';
      setToast({
        id: String(detail.at),
        text: `+${formatSolAmount(detail.amountSol, 4)} SOL raid fee${tickerBit}`,
      });
    };
    window.addEventListener(RAID_EARNING_EVENT, onEarn);
    return () => window.removeEventListener(RAID_EARNING_EVENT, onEarn);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  /** Demo credits while wallet is connected — replace with indexer webhook later. */
  useEffect(() => {
    if (!connected || !address) return;

    let cancelled = false;
    let timer: number | undefined;

    const schedule = (ms: number) => {
      timer = window.setTimeout(run, ms);
    };

    const run = () => {
      if (cancelled) return;
      if (document.visibilityState === 'hidden') {
        schedule(20_000);
        return;
      }
      const amount = Math.round((0.0015 + Math.random() * 0.0065) * 1e4) / 1e4;
      const tickers = ['PEPE', 'BONK', 'WIF', 'POPCAT', 'MEW'];
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      creditScoutEarningsDemo(address, amount, {
        ticker,
        volumeUsd: Math.round(amount * 200 * 100),
      });
      schedule(70_000 + Math.random() * 50_000);
    };

    try {
      const already = sessionStorage.getItem(DEMO_SESSION_KEY) === address;
      if (!already) {
        sessionStorage.setItem(DEMO_SESSION_KEY, address);
        schedule(9_000 + Math.random() * 4_000);
      } else {
        schedule(45_000 + Math.random() * 30_000);
      }
    } catch {
      schedule(12_000);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [connected, address]);

  // Keep React subscribers warm when other tabs write notices
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ctogo-raid-payout-notices' || e.key === 'ctogo-scout-earnings') {
        window.dispatchEvent(new Event(RAID_ALERTS_CHANGED));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[300] flex justify-center px-3"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#c8ff3d]/35 bg-[#14161f]/95 px-3.5 py-2 text-[12px] font-semibold text-[#d5ff69] shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <span aria-hidden>🔔</span>
        {toast.text}
      </div>
    </div>
  );
}
