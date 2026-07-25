import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Globe,
  ImagePlus,
  Lock,
  ShieldAlert,
  Split,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import {
  CREATOR_FEE_MODES,
  FEE_TIERS,
  formatBpsPercent,
  type CreatorFeeMode,
} from '../data/chainConfig';

type LaunchMode = 'launch' | 'add';
type FlowStep = 'details' | 'fees' | 'burn' | 'marketing' | 'done';

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const primaryBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]';

const secondaryBurnBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-400 text-sm font-bold text-[#090b14] transition hover:bg-orange-300';

const backBtnClass =
  'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5';

const VESTING_SCHEDULE = [
  { label: 'At launch', amount: '10%', note: 'Liquidity + community unlock' },
  { label: 'Day 7', amount: '20%', note: 'First cliff release' },
  { label: 'Day 30', amount: '35%', note: 'Second release' },
  { label: 'Day 90', amount: '35%', note: 'Final unlock' },
];

export function LaunchCtoPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<LaunchMode>('launch');
  const [step, setStep] = useState<FlowStep>('details');
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
  const [sourceSiteUrl, setSourceSiteUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [fromCoinPage, setFromCoinPage] = useState(false);
  const prefillApplied = useRef(false);

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
    setStep('details');
    setFromCoinPage(true);
  }, [searchParams]);

  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'your coin';
  const steps =
    mode === 'launch'
      ? [
          { id: 'details' as const, label: 'Details' },
          { id: 'fees' as const, label: 'Fees' },
          { id: 'burn' as const, label: 'Burn V1' },
          { id: 'marketing' as const, label: 'Marketing' },
        ]
      : [
          { id: 'details' as const, label: 'Details' },
          { id: 'burn' as const, label: 'Burn V1' },
          { id: 'marketing' as const, label: 'Marketing' },
        ];
  const stepIndex = steps.findIndex((s) => s.id === step);
  const selectedFeeMode = CREATOR_FEE_MODES.find((m) => m.id === feeMode)!;
  const launchTier = FEE_TIERS[0];

  const resetFlow = () => {
    setStep('details');
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
    setSourceSiteUrl('');
    setLogoPreview(null);
    setBannerPreview(null);
  };

  const switchMode = (next: LaunchMode) => {
    setMode(next);
    resetFlow();
  };

  const onDetailsContinue = (event: FormEvent) => {
    event.preventDefault();
    setStep(mode === 'launch' ? 'fees' : 'burn');
  };

  const onFeesContinue = (event: FormEvent) => {
    event.preventDefault();
    setStep('burn');
  };

  const onConfirmBurn = () => {
    setBurned(true);
  };

  const onBurnContinue = () => {
    setStep('marketing');
  };

  const onMarketingFinish = (event: FormEvent) => {
    event.preventDefault();
    setStep('done');
  };

  const readPreview = (file: File | undefined, setter: (url: string | null) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result);
    };
    reader.readAsDataURL(file);
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
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            {mode === 'launch' ? 'Launch a CTO' : 'Add a coin'}
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            {mode === 'launch'
              ? 'Relaunch a Solana coin as a community takeover.'
              : 'List a coin that is already live.'}
          </p>

          {step !== 'done' ? (
            <div className="mt-5 flex gap-1.5">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-1 flex-col gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      i <= stepIndex ? 'bg-[#c8ff3d]' : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold ${
                      i === stepIndex ? 'text-[#d5ff69]' : 'text-white/35'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {step === 'details' ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => switchMode('launch')}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    mode === 'launch'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Launch a CTO
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
                  Add a coin
                </button>
              </div>

              {mode === 'launch' ? (
                <div className="mt-5 rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.07] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#d5ff69]">Marketing wallet included</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                        Trade fees auto-fund marketing. Set up in the next steps.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white/80">Already live?</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                    Paste the mint and socials. Add a marketing wallet later.
                  </p>
                </div>
              )}

              {fromCoinPage ? (
                <div className="mt-4 rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300">
                    Prefilled from coin page
                  </p>
                  <p className="mt-1 text-[12px] text-white/55">
                    Review and continue.
                  </p>
                </div>
              ) : null}

              <form onSubmit={onDetailsContinue} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">Project name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Pixel Goblin"
                    className={fieldClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/45">Ticker</span>
                    <input
                      value={ticker}
                      onChange={(event) => setTicker(event.target.value.toUpperCase())}
                      placeholder="GOB"
                      maxLength={12}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/45">Chain</span>
                    <input
                      readOnly
                      value="Solana"
                      className={`${fieldClass} cursor-default text-white/60`}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    {mode === 'add' ? 'Mint / contract address' : 'Old V1 contract address'}
                  </span>
                  <input
                    value={contract}
                    onChange={(event) => setContract(event.target.value)}
                    placeholder="So1111… or paste mint"
                    className={`${fieldClass} font-mono text-[12px]`}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    Old Telegram <span className="font-normal text-white/30">(optional)</span>
                  </span>
                  <input
                    value={telegram}
                    onChange={(event) => setTelegram(event.target.value)}
                    placeholder="https://t.me/…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    Old X / Twitter <span className="font-normal text-white/30">(optional)</span>
                  </span>
                  <input
                    value={twitter}
                    onChange={(event) => setTwitter(event.target.value)}
                    placeholder="https://x.com/…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    Old website <span className="font-normal text-white/30">(optional)</span>
                  </span>
                  <input
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    Description <span className="font-normal text-white/25">(optional)</span>
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder={
                      mode === 'launch'
                        ? 'Why this project needs a takeover…'
                        : 'Anything we should know about this coin…'
                    }
                    className="mt-1.5 w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                  />
                </label>

                <button type="submit" className={primaryBtnClass}>
                  {mode === 'launch' ? 'Continue to fees' : 'Continue to burn'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
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
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Where the {formatBpsPercent(launchTier.creatorPoolBps)} pool cut goes. Locked
                      at deploy.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                      <Link
                        to="/fees#dynamic-tiers"
                        className="text-[#c8ff3d] underline-offset-2 hover:underline"
                      >
                        Dynamic trade fees
                      </Link>
                      <span className="text-white/20">·</span>
                      <Link
                        to="/fees#fee-guidelines"
                        className="text-[#c8ff3d] underline-offset-2 hover:underline"
                      >
                        Fee guidelines
                      </Link>
                      <span className="text-white/20">·</span>
                      <Link
                        to="/fees#abandonment"
                        className="text-[#c8ff3d] underline-offset-2 hover:underline"
                      >
                        Abandonment trigger
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
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#d5ff69]">
                                <Check className="h-3 w-3" />
                                Selected
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[11px] font-medium text-white/40">
                            {option.subtitle}
                          </p>
                          <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-white/55">
                            <li>{option.destination}</li>
                            <li className="text-white/40">Best for {option.useCase.toLowerCase()}</li>
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className={backBtnClass}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="submit" className={`${primaryBtnClass} sm:flex-1`}>
                  Continue to burn
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
                    <p className="text-sm font-bold text-orange-200">Burn V1 → receive V2</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Connect the wallet holding old {displayTicker}
                      {contract.trim() ? (
                        <>
                          {' '}
                          (<span className="font-mono text-[11px] text-white/70">
                            {contract.trim().slice(0, 6)}…{contract.trim().slice(-4)}
                          </span>
                          )
                        </>
                      ) : null}
                      . Burn V1 to mint the same amount of V2.
                    </p>
                  </div>
                </div>
              </div>

              {mode === 'launch' ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    Fee mode locked
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/85">{selectedFeeMode.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/45">{selectedFeeMode.destination}</p>
                </div>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">
                  V1 amount to burn
                </span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={burnAmount}
                    onChange={(event) => setBurnAmount(event.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    inputMode="decimal"
                    className={fieldClass + ' mt-0'}
                  />
                  <button
                    type="button"
                    onClick={() => setBurnAmount('1000000')}
                    className="h-10 shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Max
                  </button>
                </div>
              </label>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">You burn (V1)</span>
                  <span className="font-semibold text-white/80">
                    {burnAmount || '0'} {ticker.trim() || 'TOKEN'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-white/40">You receive (V2)</span>
                  <span className="font-semibold text-[#d5ff69]">
                    {burnAmount || '0'} {ticker.trim() || 'TOKEN'}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-white/35">1:1 ratio.</p>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-100">V2 is vested</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Burned holders unlock on the schedule below — no instant dump at relaunch.
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {VESTING_SCHEDULE.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-amber-300/80" />
                        <div>
                          <p className="text-xs font-semibold text-white/85">{row.label}</p>
                          <p className="text-[10px] text-white/40">{row.note}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-200">{row.amount}</span>
                    </li>
                  ))}
                </ul>

                <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={vestingAccepted}
                    onChange={(event) => setVestingAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#c8ff3d]"
                  />
                  <span className="text-[12px] leading-relaxed text-white/60">
                    I understand my V2 is vested.
                  </span>
                </label>
              </div>

              {!burned ? (
                <button type="button" onClick={onConfirmBurn} className={secondaryBurnBtnClass}>
                  <Flame className="h-4 w-4" />
                  Burn V1 &amp; mint V2
                </button>
              ) : (
                <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-3 text-center">
                  <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#d5ff69]">
                    <Check className="h-4 w-4" />
                    Burn recorded (demo)
                  </p>
                  <p className="mt-1 text-[11px] text-white/50">
                    Vested V2 queued for {displayTicker}.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setStep(mode === 'launch' ? 'fees' : 'details')}
                  className={backBtnClass}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="button" onClick={onBurnContinue} className={`${primaryBtnClass} sm:flex-1`}>
                  Continue to marketing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 'marketing' ? (
            <form onSubmit={onMarketingFinish} className="mt-6 space-y-4">
              <div className="rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#d5ff69]">Launch marketing</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Add a site, logo, and banner. Skip anything.
                    </p>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Old website URL</span>
                <input
                  value={sourceSiteUrl}
                  onChange={(event) => setSourceSiteUrl(event.target.value)}
                  placeholder="https://old-meme-site.com"
                  className={fieldClass}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left transition hover:border-[#c8ff3d]/30"
                >
                  <p className="text-xs font-bold text-white/85">Clone site</p>
                  <p className="mt-1 text-[11px] text-white/40">
                    Rebuild with new CA and socials.
                  </p>
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left transition hover:border-[#c8ff3d]/30"
                >
                  <p className="text-xs font-bold text-white/85">Simple 1-pager</p>
                  <p className="mt-1 text-[11px] text-white/40">
                    Fresh landing page.
                  </p>
                </button>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-white/45">Logo</span>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    readPreview(event.target.files?.[0], setLogoPreview);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="mt-1.5 flex h-28 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] transition hover:border-[#c8ff3d]/35"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="h-full w-full object-contain p-3" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-white/35" />
                      <span className="text-[11px] text-white/40">Upload logo</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-white/45">Banner</span>
                <input
                  ref={bannerRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    readPreview(event.target.files?.[0], setBannerPreview);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="mt-1.5 flex h-32 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] transition hover:border-[#c8ff3d]/35"
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4 text-white/35" />
                      <span className="text-[11px] text-white/40">Upload banner</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setStep('burn')}
                  className={backBtnClass}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="submit" className={`${primaryBtnClass} sm:flex-1`}>
                  Finish launch
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <div className="mt-6 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-6 text-center">
              <p className="text-sm font-bold text-[#d5ff69]">CTO launch queued</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">
                {ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'Your project'} is in for
                review.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  to="/"
                  className={`${primaryBtnClass} sm:w-auto sm:px-6`}
                >
                  Back to home
                </Link>
                <button
                  type="button"
                  onClick={resetFlow}
                  className={backBtnClass}
                >
                  Start another
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
