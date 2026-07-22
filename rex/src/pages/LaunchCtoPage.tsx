import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Globe,
  ImagePlus,
  Lock,
  RotateCcw,
  ShieldAlert,
  Split,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import {
  CREATOR_FEE_MODES,
  FEE_TIERS,
  TRADE_FEE_LABEL,
  formatBpsPercent,
  totalFeeBps,
  type CreatorFeeMode,
} from '../data/chainConfig';

type LaunchMode = 'launch' | 'add';
type FlowStep = 'details' | 'fees' | 'burn' | 'marketing' | 'done';

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const VESTING_SCHEDULE = [
  { label: 'At launch', amount: '10%', note: 'Liquidity + community unlock' },
  { label: 'Day 7', amount: '20%', note: 'First cliff release' },
  { label: 'Day 30', amount: '35%', note: 'Second release' },
  { label: 'Day 90', amount: '35%', note: 'Final unlock' },
];

export function LaunchCtoPage() {
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
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CTO home">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#c8ff3d] text-[#090b14]">
                <RotateCcw className="h-4 w-4 stroke-[2.6]" />
              </span>
              <span className="font-serif text-base font-bold tracking-tight">CTO</span>
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
              ? 'Start a Solana community takeover. Marketing wallet included.'
              : 'List an existing Solana coin or CTO that is already live.'}
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
                        Every launch creates a dedicated wallet. {TRADE_FEE_LABEL} on trades fills
                        it. Next you choose whether creator fees stay with you or cashback traders —
                        locked at deploy.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white/80">Already a CTO?</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                    Paste the mint address and community link. If it has no marketing wallet yet,
                    you can enable one after listing.
                  </p>
                </div>
              )}

              <form onSubmit={onDetailsContinue} className="mt-6 space-y-4">
                <p className="text-[11px] text-white/35">
                  Demo: continue with empty fields — nothing is required to walk the flow.
                </p>

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
                  <span className="text-[11px] font-semibold text-white/45">Telegram</span>
                  <input
                    value={telegram}
                    onChange={(event) => setTelegram(event.target.value)}
                    placeholder="https://t.me/…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">X / Twitter</span>
                  <input
                    value={twitter}
                    onChange={(event) => setTwitter(event.target.value)}
                    placeholder="https://x.com/…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">Website</span>
                  <input
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://…"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">
                    Notes <span className="font-normal text-white/25">(optional)</span>
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

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
                >
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
                  <div>
                    <p className="text-sm font-bold text-[#d5ff69]">Creator fee destination</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Choose who receives the creator/trader pool cut (
                      {formatBpsPercent(launchTier.creatorPoolBps)} at launch). This is locked
                      on-chain at deploy and cannot be changed later.
                    </p>
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
                            <li>Pays to: {option.destination}</li>
                            <li>{option.ctoMigration}</li>
                            <li>Best for: {option.useCase}</li>
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Dynamic trade fees
                </p>
                <p className="mt-1 text-[12px] text-white/50">
                  Total tax scales with market cap. Marketing never turns off.
                </p>
                <ul className="mt-3 space-y-2">
                  {FEE_TIERS.map((tier) => (
                    <li
                      key={tier.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white/85">{tier.label}</p>
                        <p className="text-[10px] text-white/40">{tier.marketCap}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold tabular-nums text-[#d5ff69]">
                          {formatBpsPercent(totalFeeBps(tier))}
                        </p>
                        <p className="text-[10px] text-white/35">
                          {formatBpsPercent(tier.marketingBps)} mkt ·{' '}
                          {formatBpsPercent(tier.creatorPoolBps)} pool ·{' '}
                          {formatBpsPercent(tier.platformBps)} Rex
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="inline-flex h-10 items-center justify-center gap-1.5 text-xs font-semibold text-white/45 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none sm:px-6"
                >
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
                      Connect the wallet that holds the old {displayTicker} mint
                      {contract.trim() ? (
                        <>
                          {' '}
                          (<span className="font-mono text-[11px] text-white/70">
                            {contract.trim().slice(0, 6)}…{contract.trim().slice(-4)}
                          </span>
                          )
                        </>
                      ) : null}
                      . Burning V1 mints matching V2 supply for the CTO relaunch.
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
                <p className="mt-2 text-[11px] text-white/35">1:1 burn ratio for this demo.</p>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-100">Vesting disclaimer</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      V2 tokens from the V1 burn are <strong className="text-white/80">vested</strong>.
                      They cannot be sold immediately. This protects new investors from an instant
                      dump by old holders at relaunch.
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
                    I understand my V2 allocation is vested and I cannot dump unlocked tokens on new
                    buyers at launch.
                  </span>
                </label>
              </div>

              {!burned ? (
                <button
                  type="button"
                  onClick={onConfirmBurn}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-400 text-sm font-bold text-[#090b14] transition hover:bg-orange-300"
                >
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
                    Vested V2 queued for {displayTicker}. Unlock follows the schedule above.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(mode === 'launch' ? 'fees' : 'details')}
                  className="inline-flex h-10 items-center justify-center gap-1.5 text-xs font-semibold text-white/45 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={onBurnContinue}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none sm:px-6"
                >
                  Continue to marketing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-center text-[11px] text-white/30">
                Demo: you can continue without burning or accepting vesting.
              </p>
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
                      Clone or rebuild the site, upload a logo and banner. You can skip anything
                      for this demo.
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
                    Preview a CTO-ready clone with new CA / socials.
                  </p>
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left transition hover:border-[#c8ff3d]/30"
                >
                  <p className="text-xs font-bold text-white/85">Simple 1-pager</p>
                  <p className="mt-1 text-[11px] text-white/40">
                    Clean landing page if the old site is messy.
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

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep('burn')}
                  className="inline-flex h-10 items-center justify-center gap-1.5 text-xs font-semibold text-white/45 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none sm:px-6"
                >
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
                {ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'Your project'} is set for
                review — V1 burn / vested V2
                {burned ? ' recorded' : ' skipped in demo'}
                {mode === 'launch' ? (
                  <>
                    , fee mode: {selectedFeeMode.title.toLowerCase()}
                  </>
                ) : null}
                , marketing assets saved.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  to="/"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
                >
                  Back to home
                </Link>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/[0.1] px-4 text-xs font-semibold text-white/60 hover:text-white"
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
