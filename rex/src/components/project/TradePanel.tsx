import { useState } from 'react';
import { ArrowDownUp, TrendingUp } from 'lucide-react';
import { BONDING_CURVE_LABEL } from '../../data/bondingCurve';

type Side = 'buy' | 'sell';

const QUICK_AMOUNTS = ['0.1', '0.5', '1', '5'];

export function TradePanel({
  symbol,
  price,
  taxRate,
}: {
  symbol: string;
  price: string;
  taxRate: string;
}) {
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');

  const isBuy = side === 'buy';

  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0e17]/80 p-4">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2">
        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-sky-400" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium text-sky-300">{BONDING_CURVE_LABEL}</span> — price moves with
          supply. Buys mint, sells burn.
        </p>
      </div>
      <div className="flex rounded-lg border border-white/10 p-1">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            !isBuy ? 'bg-rose-500/20 text-rose-400' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>You pay</span>
            <span>Balance: — SOL</span>
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none placeholder:text-muted-foreground"
            />
            <span className="shrink-0 text-sm font-medium text-muted-foreground">SOL</span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">You receive</label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <span className="min-w-0 flex-1 text-lg font-semibold text-white">
              {amount ? (parseFloat(amount || '0') * 10000).toLocaleString() : '0'}
            </span>
            <span className="shrink-0 text-sm font-medium text-sky-400">{symbol}</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">Curve price {price}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              {q} SOL
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Trading tax</span>
            <span>{taxRate}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Curve impact</span>
            <span>~1%</span>
          </div>
        </div>

        <button
          type="button"
          className={`w-full rounded-md py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
            isBuy
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-r from-rose-500 to-rose-600'
          }`}
        >
          {isBuy ? `Buy ${symbol}` : `Sell ${symbol}`}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          Connect wallet to trade on the Rex bonding curve
        </p>
      </div>
    </div>
  );
}
