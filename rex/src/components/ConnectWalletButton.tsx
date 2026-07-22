import { useCallback, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';

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

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
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

export function ConnectWalletButton({ className = '' }: { className?: string }) {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) setAddress(stored);

    const provider = getProvider();
    if (!provider?.publicKey) return;

    const sync = () => {
      const next = provider.publicKey?.toString() ?? null;
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
        return;
      }
      // Demo fallback when no extension is installed
      const demo = `Demo${Math.random().toString(36).slice(2, 10)}Wallet111111111`;
      setAddress(demo);
      writeStored(demo);
    } catch {
      // user rejected — keep disconnected
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

  if (address) {
    return (
      <button
        type="button"
        onClick={() => void disconnect()}
        disabled={busy}
        title="Disconnect wallet"
        className={`inline-flex h-10 items-center gap-2 rounded-lg border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 px-2.5 text-xs font-semibold text-[#d5ff69] transition hover:bg-[#c8ff3d]/15 disabled:opacity-50 sm:px-3 ${className}`}
      >
        <Wallet className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{shorten(address)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void connect()}
      disabled={busy}
      title="Connect wallet"
      className={`inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 text-xs font-semibold text-white transition hover:border-[#c8ff3d]/35 hover:bg-[#c8ff3d]/10 hover:text-[#d5ff69] disabled:opacity-50 sm:px-3 ${className}`}
    >
      <Wallet className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{busy ? 'Connecting…' : 'Connect wallet'}</span>
    </button>
  );
}
