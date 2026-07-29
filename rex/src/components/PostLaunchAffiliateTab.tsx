import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Users } from 'lucide-react';
import { affiliateProgramDefaults } from '../data/promotePricing';
import { notifyCommunityOnChange } from '../utils/notifyCommunityOnChange';

type PostLaunchAffiliateTabProps = {
  symbol: string;
  tokenPageUrl: string;
  telegramInvite?: string | null;
  primaryBtnClass: string;
  backBtnClass: string;
};

const DEMO_AFFILIATES = [
  { name: 'CryptoAlpha', clicks: 1240, conversions: 89, earned: '$366' },
  { name: 'MemeLord', clicks: 890, conversions: 52, earned: '$214' },
];

export function PostLaunchAffiliateTab({
  symbol,
  tokenPageUrl,
  telegramInvite,
  primaryBtnClass,
  backBtnClass,
}: PostLaunchAffiliateTabProps) {
  const [enabled, setEnabled] = useState(false);
  const [commission, setCommission] = useState(affiliateProgramDefaults.defaultCommission);
  const [savedFlash, setSavedFlash] = useState(false);
  const [copied, setCopied] = useState(false);

  const trackingLink = `${tokenPageUrl}${tokenPageUrl.includes('?') ? '&' : '?'}ref=promoter`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    notifyCommunityOnChange({
      symbol,
      kind: 'affiliate',
      summary: enabled
        ? `Affiliate programme on · ${commission}% commission`
        : 'Affiliate programme off',
      telegramInvite: telegramInvite ?? null,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-serif text-xl font-bold tracking-tight text-white">Affiliate</p>
        <p className="mt-1.5 text-sm text-white/45">
          Promoters share tracked links. Commissions pay from your marketing wallet on referred
          buys.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border-y border-white/[0.06] py-4">
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
            enabled
              ? 'border-[#c8ff3d]/50 bg-[#c8ff3d]/15 text-[#d5ff69]'
              : 'border-white/15 text-transparent'
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Enable affiliate programme</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/40">
            List {symbol} in the promoter catalogue. Payouts pause if the vault is empty.
          </p>
        </div>
      </label>

      <div className={`space-y-5 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
        <div>
          <p className="text-[11px] font-medium text-white/45">
            Commission · {commission}% of marketing tax
          </p>
          <input
            type="range"
            min={affiliateProgramDefaults.commissionMin}
            max={affiliateProgramDefaults.commissionMax}
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value))}
            className="mt-3 w-full accent-[#c8ff3d]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-white/35">
            <span>{affiliateProgramDefaults.commissionMin}%</span>
            <span>{affiliateProgramDefaults.commissionMax}%</span>
          </div>
          <p className="mt-2 text-[11px] text-white/35">
            {affiliateProgramDefaults.attributionDays}-day attribution · min payout $
            {affiliateProgramDefaults.minPayout}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-white/45">Tracking link</p>
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-white/55">
              {trackingLink}
            </p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <section className="space-y-2">
          <p className="text-[11px] font-medium text-white/45">Promoters</p>
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {DEMO_AFFILIATES.map((row) => (
              <li key={row.name} className="flex items-center gap-3 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#d5ff69]">
                  <Users className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{row.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {row.clicks.toLocaleString()} clicks · {row.conversions} conv.
                  </p>
                </div>
                <p className="text-[13px] font-semibold tabular-nums text-[#d5ff69]">{row.earned}</p>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-white/30">Demo stats until tracking is live.</p>
        </section>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button type="button" onClick={save} className={`${primaryBtnClass} sm:flex-1`}>
          {savedFlash ? (
            <>
              Saved
              <Check className="h-4 w-4" />
            </>
          ) : (
            'Save affiliate settings'
          )}
        </button>
        <Link to="/affiliates" className={backBtnClass}>
          Promoter catalogue
        </Link>
      </div>

      <p className="text-[11px] text-white/35">
        Community will be notified in Telegram when the programme goes live.
      </p>
    </div>
  );
}
