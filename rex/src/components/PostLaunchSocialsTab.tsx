import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { notifyCommunityOnChange } from '../utils/notifyCommunityOnChange';
import {
  DILIGENCE_CHECKLIST,
  checkTextForMint,
  checkUrlForMint,
  shortMint,
  type DiligenceResult,
} from '../utils/socialDueDiligence';

export type DashWebsiteKind = 'clone' | 'none' | 'own';

type PostLaunchSocialsTabProps = {
  symbol: string;
  tradedContract: string;
  initialTwitter: string;
  initialTelegram: string;
  initialDiscord: string;
  initialWebsiteUrl: string;
  initialWebsiteKind: DashWebsiteKind;
  primaryBtnClass: string;
  backBtnClass: string;
};

type DiligenceMap = Partial<Record<'x' | 'website', DiligenceResult>>;

export function PostLaunchSocialsTab({
  symbol,
  tradedContract,
  initialTwitter,
  initialTelegram,
  initialDiscord,
  initialWebsiteUrl,
  initialWebsiteKind,
  primaryBtnClass,
  backBtnClass,
}: PostLaunchSocialsTabProps) {
  const [twitter, setTwitter] = useState(initialTwitter);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [discord, setDiscord] = useState(initialDiscord);
  const [websiteKind, setWebsiteKind] = useState<DashWebsiteKind>(
    initialWebsiteKind === 'none' ? 'own' : initialWebsiteKind,
  );
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      twitter: initialTwitter,
      telegram: initialTelegram,
      discord: initialDiscord,
      websiteKind: initialWebsiteKind === 'none' ? 'own' : initialWebsiteKind,
      websiteUrl: initialWebsiteUrl,
    }),
  );
  const [savedFlash, setSavedFlash] = useState(false);
  const [modeConfirm, setModeConfirm] = useState<DashWebsiteKind | null>(null);
  const [diligence, setDiligence] = useState<DiligenceMap>({});
  const [scanText, setScanText] = useState('');
  const [scanning, setScanning] = useState(false);

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        twitter,
        telegram,
        discord,
        websiteKind,
        websiteUrl,
      }),
    [twitter, telegram, discord, websiteKind, websiteUrl],
  );
  const dirty = currentSnapshot !== savedSnapshot;

  const requestWebsiteKind = (next: DashWebsiteKind) => {
    if (next === websiteKind) return;
    if (websiteKind === 'clone' && (next === 'own' || next === 'none')) {
      setModeConfirm(next);
      return;
    }
    if ((websiteKind === 'own' || websiteKind === 'none') && next === 'clone') {
      setModeConfirm(next);
      return;
    }
    setWebsiteKind(next);
  };

  const confirmModeSwitch = () => {
    if (!modeConfirm) return;
    setWebsiteKind(modeConfirm);
    setModeConfirm(null);
    setDiligence((d) => ({ ...d, website: undefined }));
  };

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

      const siteUrl = checkUrlForMint('website', websiteUrl, tradedContract);
      const siteText = scanText.trim()
        ? checkTextForMint('website', scanText, tradedContract)
        : null;
      const website: DiligenceResult =
        siteUrl.status === 'matched' || siteUrl.status === 'mismatch'
          ? siteUrl
          : siteText && siteText.status !== 'empty'
            ? siteText
            : siteUrl;

      setDiligence({ x, website });
      setScanning(false);
    }, 450);
  };

  const saveSocials = () => {
    setSavedSnapshot(currentSnapshot);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    notifyCommunityOnChange({
      symbol,
      kind: websiteKind !== JSON.parse(savedSnapshot).websiteKind ? 'website' : 'socials',
      summary: `Updated socials${websiteUrl.trim() ? ' · website' : ''}`,
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
          Update CTOgo presence. Independent sites welcome — we check against the contract on
          Overview.
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
        <p className="text-[11px] font-medium text-white/45">Website</p>
        <p className="text-[12px] leading-relaxed text-white/40">
          Paste your own site URL, or clone an old site on CTOgo.
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'own' as const, label: 'Own site', hint: 'Your URL' },
              { id: 'clone' as const, label: 'Clone', hint: 'CTOgo' },
              { id: 'none' as const, label: 'None', hint: 'No site' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => requestWebsiteKind(opt.id)}
              className={`rounded-lg border px-2 py-2 text-left transition ${
                websiteKind === opt.id
                  ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/12'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              <p className="text-[11px] font-semibold text-white">{opt.label}</p>
              <p className="mt-0.5 text-[9px] text-white/40">{opt.hint}</p>
            </button>
          ))}
        </div>

        {modeConfirm ? (
          <div className="space-y-3 rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
            <p className="flex items-start gap-2 text-[12px] leading-relaxed text-amber-100/90">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This replaces the public site link holders see. Continue?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={confirmModeSwitch} className={primaryBtnClass}>
                Replace site link
              </button>
              <button type="button" onClick={() => setModeConfirm(null)} className={backBtnClass}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {websiteKind === 'own' || websiteKind === 'clone' ? (
          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold text-white/40">
              {websiteKind === 'own' ? 'Your website URL' : 'Clone source URL'}
            </span>
            <div className="flex gap-2">
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://…"
                className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
              />
              {websiteUrl.trim() ? (
                <a
                  href={websiteUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/[0.1] text-white/45 hover:text-white"
                  aria-label="Open website"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </label>
        ) : null}

        {websiteKind === 'none' ? (
          <p className="text-[12px] text-white/40">No public website linked.</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#d5ff69]" />
          <p className="text-[11px] font-medium text-white/45">Contract due diligence</p>
        </div>
        <p className="text-[12px] leading-relaxed text-white/40">
          Checks that X and your site reference the mint shown on Overview ({shortMint(tradedContract)}
          ). Live page/X scraping needs a server later — for now we scan URLs and pasted text.
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
        {(diligence.x || diligence.website) && (
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {(
              [
                { key: 'x' as const, label: 'X' },
                { key: 'website' as const, label: 'Website' },
              ] as const
            ).map((row) => {
              const r = diligence[row.key];
              return (
                <li key={row.key} className="py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{row.label}</p>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wide ${statusTone(r?.status)}`}
                    >
                      {statusLabel(r?.status)}
                    </p>
                  </div>
                  {r ? (
                    <p className="mt-1 text-[11px] leading-relaxed text-white/40">{r.detail}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
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
