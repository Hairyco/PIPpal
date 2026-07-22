import { useState } from 'react';
import { Clock, Coins, ExternalLink, Send } from 'lucide-react';
import {
  marketingBundles,
  type BundleFunding,
  type MarketingBundleId,
} from '../../data/marketingBundles';

type BundleChoice = {
  funding: BundleFunding | null;
  queued: boolean;
};

const DEFAULT_CHOICES: Record<MarketingBundleId, BundleChoice> = {
  'launch-starter': { funding: null, queued: false },
  'coingecko-cto': { funding: null, queued: false },
  'dexscreener-ads': { funding: null, queued: false },
};

/** Post-launch: pick which supplier bundles to fund next. */
export function PostLaunchBundlesPanel({
  starterFunding,
}: {
  starterFunding?: BundleFunding | null;
}) {
  const [choices, setChoices] = useState<Record<MarketingBundleId, BundleChoice>>(() => ({
    ...DEFAULT_CHOICES,
    'launch-starter': {
      funding: starterFunding ?? null,
      queued: starterFunding === 'wait-wallet',
    },
  }));

  const select = (id: MarketingBundleId, funding: BundleFunding) => {
    setChoices((prev) => ({
      ...prev,
      [id]: { funding, queued: funding === 'wait-wallet' },
    }));
  };

  return (
    <div className="dex-card">
      <div className="relative z-[1] space-y-4">
        <div>
          <h3 className="font-semibold text-white">Marketing bundles</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            After your coin is live, pick which supplier to pay next — from the marketing wallet or
            up-front.
          </p>
        </div>

        <div className="space-y-3">
          {marketingBundles.map((bundle) => {
            const choice = choices[bundle.id];
            return (
              <div
                key={bundle.id}
                className={`rounded-xl border p-4 ${
                  bundle.available
                    ? 'border-white/10 bg-white/[0.02]'
                    : 'border-white/5 bg-white/[0.01] opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{bundle.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{bundle.summary}</p>
                    {bundle.supplierHint ? (
                      <p className="mt-1 text-[10px] text-sky-300/80">Supplier: {bundle.supplierHint}</p>
                    ) : null}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {bundle.approxSol} · {bundle.priceHint}
                  </span>
                </div>

                {!bundle.available ? (
                  <p className="mt-3 text-[11px] text-amber-200/80">Coming next — details TBD.</p>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => select(bundle.id, 'wait-wallet')}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] font-medium transition ${
                        choice.funding === 'wait-wallet'
                          ? 'border-white bg-white text-[#090b14]'
                          : 'border-white/10 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Wait for wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => select(bundle.id, 'pay-now')}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] font-medium transition ${
                        choice.funding === 'pay-now'
                          ? 'border-white bg-white text-[#090b14]'
                          : 'border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15'
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5 shrink-0" />
                      Pay now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Unlocks after launch-starter is paid — soft ops intake for site edits. */
export function SiteChangeRequestCard({ unlocked }: { unlocked: boolean }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!unlocked) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-white">Website change requests</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlocks after the launch starter bundle is paid (wallet or up-front). Edit fee TBD.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.05] p-4">
      <div className="flex items-start gap-2">
        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Request a website change</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tell us what to update on your hosted page. We push the change after review (fee TBD).
          </p>
          {sent ? (
            <p className="mt-3 text-xs text-emerald-300">Request submitted — Rex ops will follow up.</p>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="e.g. Update CA, swap Telegram link, fix hero copy…"
                className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none"
              />
              <button
                type="button"
                disabled={!message.trim()}
                onClick={() => setSent(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-200 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                Submit request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
