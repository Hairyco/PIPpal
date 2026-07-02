import { useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import {
  REX_GENERATE_IMAGE_COST,
  REX_TOKEN_SYMBOL,
  rexTokenPackages,
  type RexTokenPackage,
} from '../../data/rexToken';
import { addRexTokens, getRexTokenBalance } from '../../utils/rexTokenWallet';

interface BuyRexTokenModalProps {
  open: boolean;
  onClose: () => void;
  onPurchased: (newBalance: number) => void;
  requiredAmount?: number;
}

export function BuyRexTokenModal({
  open,
  onClose,
  onPurchased,
  requiredAmount,
}: BuyRexTokenModalProps) {
  const [buying, setBuying] = useState<string | null>(null);

  if (!open) return null;

  const handleBuy = async (pkg: RexTokenPackage) => {
    setBuying(pkg.id);
    await new Promise((r) => setTimeout(r, 600));
    const balance = addRexTokens(pkg.rexAmount);
    setBuying(null);
    onPurchased(balance);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-rex-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e17] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rex-gradient">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 id="buy-rex-title" className="font-semibold text-white">
              Buy {REX_TOKEN_SYMBOL} token
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {requiredAmount
                ? `You need at least ${requiredAmount} ${REX_TOKEN_SYMBOL} to generate an image.`
                : `Purchase ${REX_TOKEN_SYMBOL} to unlock AI image generation and future Rex utilities.`}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Balance: {getRexTokenBalance().toLocaleString()} {REX_TOKEN_SYMBOL}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {rexTokenPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              disabled={buying !== null}
              onClick={() => handleBuy(pkg)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${
                pkg.popular
                  ? 'border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/15'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {pkg.label}
                  {pkg.popular && (
                    <span className="ml-2 text-[10px] font-normal text-sky-400">Popular</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pkg.rexAmount.toLocaleString()} {REX_TOKEN_SYMBOL}
                </p>
              </div>
              <span className="text-sm font-semibold text-white">
                {buying === pkg.id ? '…' : `$${pkg.priceUsd.toFixed(2)}`}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          Demo checkout — no charge. On mainnet, {REX_TOKEN_SYMBOL} will be purchased via your
          connected wallet on Solana.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-white/10 py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function RexTokenBadge({ balance }: { balance: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300">
      <Sparkles className="h-3 w-3" />
      {balance.toLocaleString()} {REX_TOKEN_SYMBOL}
    </span>
  );
}
