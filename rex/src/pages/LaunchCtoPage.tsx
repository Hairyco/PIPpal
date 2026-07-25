import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Flame,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Split,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { CoinPagePreview } from '../components/CoinPagePreview';
import {
  CREATOR_FEE_MODES,
  FEE_TIERS,
  formatBpsPercent,
  type CreatorFeeMode,
} from '../data/chainConfig';
import {
  generateCtoBannerWithLogo,
  generateCtoLogoDataUrl,
  readImageFile,
} from '../utils/ctoCollateralGenerate';
import { formatMintPreview, resolveLaunchCoin } from '../utils/resolveLaunchCoin';

type LaunchMode = 'launch' | 'add';
type FlowStep = 'coin' | 'fees' | 'burn' | 'page' | 'done';

const fieldClass =
  'mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const primaryBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:cursor-not-allowed disabled:opacity-40';

const secondaryBurnBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-400 text-sm font-bold text-[#090b14] transition hover:bg-orange-300';

const backBtnClass =
  'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5';

const VESTING_SCHEDULE = [
  { label: 'At launch', amount: '10%' },
  { label: 'Day 7', amount: '20%' },
  { label: 'Day 30', amount: '35%' },
  { label: 'Day 90', amount: '35%' },
];

export function LaunchCtoPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LaunchMode>('launch');
  const [step, setStep] = useState<FlowStep>('coin');
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [contract, setContract] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [note, setNote] = useState('');
  const [feeMode, setFeeMode] = useState<CreatorFeeMode>('creator');
  const [burnAmount, setBurnAmount] = useState('');
  const [vestingAccepted, setVestingAccepted] = useState(false);
  const [burned, setBurned] = useState(false);
  const [pageBlurb, setPageBlurb] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoSalt, setLogoSalt] = useState(0);
  const [bannerSalt, setBannerSalt] = useState(0);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [coinReady, setCoinReady] = useState(false);
  const [venueLabel, setVenueLabel] = useState('Solana');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editArt, setEditArt] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [fromCoinPage, setFromCoinPage] = useState(false);
  const prefillApplied = useRef(false);
  const lookupSeq = useRef(0);

  useEffect(() => {
    if (prefillApplied.current) return;
    const qName = searchParams.get('name')?.trim() ?? '';
    const qTicker = searchParams.get('ticker')?.trim() ?? '';
    const qCa = searchParams.get('ca')?.trim() ?? '';
    if (!qName && !qTicker && !qCa) return;
    prefillApplied.current = true;
    if (qName) setName(qName);
    if (qTicker) setTicker(qTicker.replace(/^\$/, ''));
    if (qCa) setContract(qCa);
    setMode('launch');
    setStep('coin');
    setFromCoinPage(true);
    if (qCa) {
      void runLookup(qCa, qName, qTicker.replace(/^\$/, ''));
    } else if (qName || qTicker) {
      setCoinReady(true);
      setVenueLabel('CTOgo');
      const logo = generateCtoLogoDataUrl({
        projectName: qName || 'CTOgo Coin',
        ticker: qTicker.replace(/^\$/, '') || 'CTO',
      });
      setLogoPreview(logo);
      setPageBlurb(`${qName || 'This coin'} community takeover on CTOgo.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'your coin';
  const steps =
    mode === 'launch'
      ? [
          { id: 'coin' as const, label: 'Coin' },
          { id: 'fees' as const, label: 'Fees' },
          { id: 'burn' as const, label: 'Burn' },
          { id: 'page' as const, label: 'Page' },
        ]
      : [
          { id: 'coin' as const, label: 'Coin' },
          { id: 'burn' as const, label: 'Burn' },
          { id: 'page' as const, label: 'Page' },
        ];
  const stepIndex = steps.findIndex((s) => s.id === step);
  const selectedFeeMode = CREATOR_FEE_MODES.find((m) => m.id === feeMode)!;
  const launchTier = FEE_TIERS[0];
  const canContinueCoin = coinReady && Boolean(name.trim() && ticker.trim());

  const resetFlow = () => {
    setStep('coin');
    setName('');
    setTicker('');
    setContract('');
    setTelegram('');
    setTwitter('');
    setWebsite('');
    setNote('');
    setFeeMode('creator');
    setBurnAmount('');
    setVestingAccepted(false);
    setBurned(false);
    setPageBlurb('');
    setLogoPreview(null);
    setBannerPreview(null);
    setLogoSalt(0);
    setBannerSalt(0);
    setLookupBusy(false);
    setLookupError(null);
    setCoinReady(false);
    setVenueLabel('Solana');
    setShowAdvanced(false);
    setEditArt(false);
    setFromCoinPage(false);
  };

  const switchMode = (next: LaunchMode) => {
    setMode(next);
    resetFlow();
  };

  async function runLookup(mint: string, keepName?: string, keepTicker?: string) {
    const seq = ++lookupSeq.current;
    setLookupBusy(true);
    setLookupError(null);
    setCoinReady(false);
    try {
      const meta = await resolveLaunchCoin(mint);
      if (seq !== lookupSeq.current) return;
      if (!meta) {
        setLookupError('Paste a full Solana mint (32+ characters).');
        return;
      }
      setContract(meta.mint);
      setName(keepName?.trim() || meta.name);
      setTicker((keepTicker?.trim() || meta.ticker).toUpperCase());
      setLogoPreview(meta.logoUrl);
      setPageBlurb(meta.blurb);
      setVenueLabel(meta.venueLabel);
      setCoinReady(true);
    } catch {
      if (seq !== lookupSeq.current) return;
      setLookupError('Could not resolve coin. Try again.');
    } finally {
      if (seq === lookupSeq.current) setLookupBusy(false);
    }
  }

  const onCoinContinue = (event: FormEvent) => {
    event.preventDefault();
    if (!canContinueCoin) return;
    setStep(mode === 'launch' ? 'fees' : 'burn');
  };

  const onFeesContinue = (event: FormEvent) => {
    event.preventDefault();
    setStep('burn');
  };

  const goToPage = () => setStep('page');

  const onMarketingFinish = (event: FormEvent) => {
    event.preventDefault();
    setStep('done');
  };

  const makeLogo = (salt = logoSalt) => {
    setGeneratingLogo(true);
    try {
      const url = generateCtoLogoDataUrl({
        projectName: name || 'CTOgo Coin',
        ticker: ticker || 'CTO',
        salt,
      });
      setLogoPreview(url);
      return url;
    } finally {
      setGeneratingLogo(false);
    }
  };

  const makeBanner = async (salt = bannerSalt, logoUrl?: string | null) => {
    setGeneratingBanner(true);
    try {
      const url = await generateCtoBannerWithLogo({
        projectName: name || 'Community Takeover',
        ticker: ticker || 'CTO',
        logoDataUrl: logoUrl ?? logoPreview,
        tagline: pageBlurb || note || 'Community takeover on CTOgo',
        salt,
      });
      setBannerPreview(url);
    } finally {
      setGeneratingBanner(false);
    }
  };

  const regenerateLogo = () => {
    const next = logoSalt + 1;
    setLogoSalt(next);
    const url = makeLogo(next);
    void makeBanner(bannerSalt, url);
  };

  const regenerateBanner = () => {
    const next = bannerSalt + 1;
    setBannerSalt(next);
    void makeBanner(next);
  };

  useEffect(() => {
    if (step !== 'page') return;

    if (!pageBlurb.trim() && note.trim()) setPageBlurb(note.trim());

    const projectName = name || 'CTOgo Coin';
    const projectTicker = ticker || 'CTO';
    let logo = logoPreview;
    if (!logo) {
      logo = generateCtoLogoDataUrl({
        projectName,
        ticker: projectTicker,
        salt: logoSalt,
      });
      setLogoPreview(logo);
    }

    if (bannerPreview) return;

    let cancelled = false;
    void generateCtoBannerWithLogo({
      projectName: name || 'Community Takeover',
      ticker: projectTicker,
      logoDataUrl: logo,
      tagline: (pageBlurb || note || 'Community takeover on CTOgo').trim(),
      salt: bannerSalt,
    }).then((banner) => {
      if (!cancelled) setBannerPreview(banner);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onUploadLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await readImageFile(file);
      setLogoPreview(url);
      void makeBanner(bannerSalt, url);
    } catch {
      // ignore
    }
  };

  const onUploadBanner = async (file: File | undefined) => {
    if (!file) return;
    try {
      setBannerPreview(await readImageFile(file));
    } catch {
      // ignore
    }
  };

  return (
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <div className="relative z-[1]">
        <header className="border-b border-white/[0.07] bg-[#090b14]">
          <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-3 sm:px-5">
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CTOgo home">
              <CtoGoLogo size={32} className="rounded-xl" />
              <span className="font-serif text-base font-bold tracking-tight">CTOgo</span>
            </Link>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-xl px-3 py-8 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
            CTO Launch Wizard
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
            {mode === 'launch' ? 'Launch a CTO' : 'Add a coin'}
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            Paste any Solana mint. We pull what we can.
          </p>

          {step !== 'done' ? (
            <div className="mt-5 flex gap-1.5">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-1 flex-col gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      i < stepIndex
                        ? 'bg-[#c8ff3d]'
                        : i === stepIndex
                          ? 'bg-[#c8ff3d]'
                          : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold ${
                      i === stepIndex
                        ? 'text-[#d5ff69]'
                        : i < stepIndex
                          ? 'text-white/55'
                          : 'text-white/30'
                    }`}
                  >
                    {i < stepIndex ? <Check className="h-3 w-3" /> : null}
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {step === 'coin' ? (
            <form onSubmit={onCoinContinue} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => switchMode('launch')}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    mode === 'launch'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Launch CTO
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('add')}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    mode === 'add'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Add coin
                </button>
              </div>

              {fromCoinPage ? (
                <p className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
                  Prefilling from the coin page…
                </p>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Contract address</span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={contract}
                    onChange={(event) => {
                      setContract(event.target.value);
                      setCoinReady(false);
                      setLookupError(null);
                    }}
                    placeholder="Contract address"
                    className={`${fieldClass} mt-0 font-mono text-[12px]`}
                  />
                  <button
                    type="button"
                    onClick={() => void runLookup(contract)}
                    disabled={lookupBusy || contract.trim().length < 8}
                    className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 px-3 text-xs font-bold text-[#d5ff69] disabled:opacity-40"
                  >
                    {lookupBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    Find
                  </button>
                </div>
              </label>

              {lookupError ? (
                <p className="text-[12px] text-rose-300">{lookupError}</p>
              ) : null}

              {lookupBusy ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center text-[12px] text-white/45">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#c8ff3d]" />
                  Looking up coin…
                </div>
              ) : null}

              {coinReady && !lookupBusy ? (
                <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.07] p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-black/30">
                      {logoPreview ? (
                        <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-white/30">Logo</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-serif text-lg font-bold text-white">
                          {name || 'Unknown'}
                        </p>
                        <span className="rounded bg-[#c8ff3d]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#d5ff69]">
                          {venueLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#c8ff3d]">
                        {ticker ? `$${ticker}` : '—'}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-white/35">
                        {formatMintPreview(contract)}
                      </p>
                    </div>
                    <Check className="h-5 w-5 shrink-0 text-[#c8ff3d]" />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-white/40">Name</span>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={`${fieldClass} mt-1 h-9 text-sm`}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold text-white/40">Ticker</span>
                      <input
                        value={ticker}
                        onChange={(event) => setTicker(event.target.value.toUpperCase())}
                        maxLength={12}
                        className={`${fieldClass} mt-1 h-9 text-sm`}
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-left text-[11px] font-semibold text-white/45 hover:text-white/70"
              >
                Advanced (old socials)
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
              </button>

              {showAdvanced ? (
                <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/40">Old Telegram</span>
                    <input
                      value={telegram}
                      onChange={(event) => setTelegram(event.target.value)}
                      placeholder="https://t.me/…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/40">Old X / Twitter</span>
                    <input
                      value={twitter}
                      onChange={(event) => setTwitter(event.target.value)}
                      placeholder="https://x.com/…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/40">Old website</span>
                    <input
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      placeholder="https://…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/40">Notes</span>
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={2}
                      placeholder="Optional"
                      className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                    />
                  </label>
                </div>
              ) : null}

              <button type="submit" disabled={!canContinueCoin} className={primaryBtnClass}>
                Looks good
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : null}

          {step === 'fees' ? (
            <form onSubmit={onFeesContinue} className="mt-6 space-y-4">
              <div className="rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
                    <Split className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#d5ff69]">Creator fee destination</p>
                    <p className="mt-1 text-[12px] text-white/55">
                      {formatBpsPercent(launchTier.creatorPoolBps)} pool cut. Locked at deploy.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                      <Link to="/fees#dynamic-tiers" className="text-[#c8ff3d] hover:underline">
                        Fees
                      </Link>
                      <span className="text-white/20">·</span>
                      <Link to="/fees#abandonment" className="text-[#c8ff3d] hover:underline">
                        Abandonment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {CREATOR_FEE_MODES.map((option) => {
                  const selected = feeMode === option.id;
                  const Icon = option.id === 'creator' ? Wallet : Users;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFeeMode(option.id)}
                      className={`w-full rounded-xl border px-4 py-3.5 text-left transition ${
                        selected
                          ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            selected
                              ? 'bg-[#c8ff3d]/20 text-[#c8ff3d]'
                              : 'bg-white/5 text-white/45'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-white">{option.title}</p>
                            {selected ? (
                              <span className="text-[10px] font-semibold text-[#d5ff69]">
                                Selected
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[11px] text-white/50">{option.destination}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button type="button" onClick={() => setStep('coin')} className={backBtnClass}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="submit" className={`${primaryBtnClass} sm:flex-1`}>
                  Looks good
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'burn' ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.08] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-400/15 text-orange-300">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-orange-200">Burn V1 → get V2</p>
                    <p className="mt-1 text-[12px] text-white/55">
                      Optional now. Burn {displayTicker} 1:1 into vested V2.
                    </p>
                  </div>
                </div>
              </div>

              {mode === 'launch' ? (
                <p className="text-[11px] text-white/40">
                  Fee mode: <span className="text-white/70">{selectedFeeMode.title}</span>
                </p>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Amount</span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={burnAmount}
                    onChange={(event) => setBurnAmount(event.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    inputMode="decimal"
                    className={`${fieldClass} mt-0`}
                  />
                  <button
                    type="button"
                    onClick={() => setBurnAmount('1000000')}
                    className="h-11 shrink-0 rounded-xl border border-white/[0.08] px-3 text-xs font-semibold text-white/60"
                  >
                    Max
                  </button>
                </div>
              </label>

              <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3">
                <div className="flex items-center gap-2 text-amber-100">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-xs font-bold">V2 unlocks over 90 days</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VESTING_SCHEDULE.map((row) => (
                    <span
                      key={row.label}
                      className="inline-flex items-center gap-1 rounded-md bg-black/25 px-2 py-1 text-[10px] text-white/55"
                    >
                      <Lock className="h-3 w-3 text-amber-300/80" />
                      {row.label} · {row.amount}
                    </span>
                  ))}
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vestingAccepted}
                    onChange={(event) => setVestingAccepted(event.target.checked)}
                    className="h-4 w-4 rounded accent-[#c8ff3d]"
                  />
                  <span className="text-[12px] text-white/55">I understand V2 is vested</span>
                </label>
              </div>

              {!burned ? (
                <button type="button" onClick={() => setBurned(true)} className={secondaryBurnBtnClass}>
                  <Flame className="h-4 w-4" />
                  Burn V1 &amp; mint V2
                </button>
              ) : (
                <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-3 text-center text-sm font-bold text-[#d5ff69]">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Burn recorded
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setStep(mode === 'launch' ? 'fees' : 'coin')}
                  className={backBtnClass}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="button" onClick={goToPage} className={`${primaryBtnClass} sm:flex-1`}>
                  {burned ? 'Looks good' : 'Skip for now'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 'page' ? (
            <form onSubmit={onMarketingFinish} className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-white">Your CTOgo page is ready</p>
                <p className="mt-1 text-[12px] text-white/45">
                  Hosted for you. Edit only if you want.
                </p>
              </div>

              <CoinPagePreview
                name={name}
                ticker={ticker}
                blurb={pageBlurb || note}
                logoUrl={logoPreview}
                bannerUrl={bannerPreview}
                contract={contract}
              />

              <button
                type="button"
                onClick={() => setEditArt((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-[11px] font-semibold text-white/55 hover:text-white"
              >
                {editArt ? 'Hide editor' : 'Edit blurb / art'}
                <ChevronDown className={`h-4 w-4 transition-transform ${editArt ? 'rotate-180' : ''}`} />
              </button>

              {editArt ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/45">Page blurb</span>
                    <textarea
                      value={pageBlurb}
                      onChange={(event) => setPageBlurb(event.target.value)}
                      rows={2}
                      placeholder="One line about the takeover…"
                      className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={regenerateLogo}
                      disabled={generatingLogo}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[11px] font-semibold text-white/60"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload logo
                    </button>
                    <button
                      type="button"
                      onClick={regenerateBanner}
                      disabled={generatingBanner}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Banner
                    </button>
                    <button
                      type="button"
                      onClick={() => bannerRef.current?.click()}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[11px] font-semibold text-white/60"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload banner
                    </button>
                  </div>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void onUploadLogo(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                  <input
                    ref={bannerRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void onUploadBanner(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button type="button" onClick={() => setStep('burn')} className={backBtnClass}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="submit" className={`${primaryBtnClass} sm:flex-1`}>
                  Publish CTO
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <div className="mt-6 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-6 text-center">
              <p className="text-sm font-bold text-[#d5ff69]">CTO published</p>
              <p className="mt-1.5 text-xs text-white/50">
                {ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'Your project'} is live in
                review.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/" className={`${primaryBtnClass} sm:w-auto sm:px-6`}>
                  Back to home
                </Link>
                <button type="button" onClick={resetFlow} className={backBtnClass}>
                  Launch another
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
