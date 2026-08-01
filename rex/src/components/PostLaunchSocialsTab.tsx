import { useMemo, useState } from 'react';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { notifyCommunityOnChange } from '../utils/notifyCommunityOnChange';
import {
  DILIGENCE_CHECKLIST,
  checkTextForMint,
  checkUrlForMint,
  shortMint,
  type DiligenceResult,
} from '../utils/socialDueDiligence';

/** Kept for dashboard / launch typing — website edits move to Contact. */
export type DashWebsiteKind = 'clone' | 'none' | 'own';

type PostLaunchSocialsTabProps = {
  symbol: string;
  tradedContract: string;
  initialTwitter: string;
  initialTelegram: string;
  initialDiscord: string;
  primaryBtnClass: string;
  backBtnClass: string;
};

type DiligenceMap = Partial<Record<'x', DiligenceResult>>;

export function PostLaunchSocialsTab({
  symbol,
  tradedContract,
  initialTwitter,
  initialTelegram,
  initialDiscord,
  primaryBtnClass,
  backBtnClass,
}: PostLaunchSocialsTabProps) {
  const [twitter, setTwitter] = useState(initialTwitter);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [discord, setDiscord] = useState(initialDiscord);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      twitter: initialTwitter,
      telegram: initialTelegram,
      discord: initialDiscord,
    }),
  );
  const [savedFlash, setSavedFlash] = useState(false);
  const [diligence, setDiligence] = useState<DiligenceMap>({});
  const [scanText, setScanText] = useState('');
  const [scanning, setScanning] = useState(false);

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        twitter,
        telegram,
        discord,
      }),
    [twitter, telegram, discord],
  );
  const dirty = currentSnapshot !== savedSnapshot;

  const runDiligence = () => {
    setScanning(true);
    window.setTimeout(() => {
      const xUrl = checkUrlForMint('x', twitter, tradedContract);
      const xText = scanText.trim()
        ? checkTextForMint('x', scanText, tradedContract)
        : null;
      const x: DiligenceResult =
        xUrl.status === 'matched' || xUrl.status === 'mismatch'
          ? xUrl
          : xText && xText.status !== 'empty'
            ? xText
            : xUrl;

      setDiligence({ x });
      setScanning(false);
    }, 450);
  };

  const saveSocials = () => {
    setSavedSnapshot(currentSnapshot);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    notifyCommunityOnChange({
      symbol,
      kind: 'socials',
      summary: 'Updated socials',
      telegramInvite: telegram.trim() || null,
    });
  };

  const statusTone = (status: DiligenceResult['status'] | undefined) => {
    if (status === 'matched') return 'text-[#d5ff69]';
    if (status === 'mismatch') return 'text-red-300';
    if (status === 'not_found') return 'text-amber-200/90';
    return 'text-white/40';
  };

  const statusLabel = (status: DiligenceResult['status'] | undefined) => {
    if (status === 'matched') return 'Matched CTOgo CA';
    if (status === 'mismatch') return 'Mismatch';
    if (status === 'not_found') return 'CA not found';
    if (status === 'empty') return 'Not set';
    return 'Not checked';
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-serif text-xl font-bold tracking-tight text-white">Socials</p>
        <p className="mt-1.5 text-sm text-white/45">
          Update X, Telegram, and Discord.{' '}
          <a
            href="/contact"
            className="font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2"
          >
            Website changes → Contact
          </a>
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-[11px] font-medium text-white/45">Links</p>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-white/40">X (Twitter)</span>
          <input
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://x.com/…"
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-white/40">Telegram community</span>
          <input
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="https://t.me/…"
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-white/40">Discord (optional)</span>
          <input
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="https://discord.gg/…"
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
          />
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#d5ff69]" />
          <p className="text-[11px] font-medium text-white/45">Contract due diligence</p>
        </div>
        <p className="text-[12px] leading-relaxed text-white/40">
          Checks that X references the mint shown on Overview ({shortMint(tradedContract)}). Live
          page/X scraping needs a server later — for now we scan URLs and pasted text.
        </p>
        <ul className="space-y-1.5">
          {DILIGENCE_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 text-[11px] text-white/45">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
              {item}
            </li>
          ))}
        </ul>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-white/40">
            Paste X bio / site text (optional)
          </span>
          <textarea
            value={scanText}
            onChange={(e) => setScanText(e.target.value)}
            rows={3}
            placeholder={`Paste text that should include ${shortMint(tradedContract)}`}
            className="w-full resize-y rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
          />
        </label>
        <button
          type="button"
          onClick={runDiligence}
          disabled={scanning}
          className={backBtnClass}
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {scanning ? 'Checking…' : 'Run due diligence'}
        </button>
        {diligence.x ? (
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            <li className="py-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-white">X</p>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${statusTone(diligence.x.status)}`}
                >
                  {statusLabel(diligence.x.status)}
                </p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                {diligence.x.detail}
              </p>
            </li>
          </ul>
        ) : null}
      </section>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!dirty}
          onClick={saveSocials}
          className={`${primaryBtnClass} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {savedFlash ? (
            <>
              Saved
              <Check className="h-4 w-4" />
            </>
          ) : (
            'Save changes'
          )}
        </button>
        <p className="text-[11px] text-white/35">
          Community will be notified in Telegram when changes go live.
        </p>
      </div>
    </div>
  );
}
