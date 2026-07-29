import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Mail,
  Sparkles,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { useConnectedWallet } from '../components/ConnectWalletButton';
import { LAUNCH_PACK, formatSolPrice } from '../data/directServices';
import { readImageFile } from '../utils/projectImageGenerate';
import {
  createServiceOrderDraft,
  getServiceOrder,
  markServiceOrderPaid,
  type ServiceOrder,
} from '../utils/serviceOrders';

type Step = 'offer' | 'form' | 'pay' | 'done';

const inputClass =
  'w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-base text-white placeholder:text-white/30 outline-none focus:border-[#c8ff3d]/40';

export function ServicesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resumeId = params.get('order');
  const { connected, connect, busy: walletBusy, address } = useConnectedWallet();

  const [step, setStep] = useState<Step>(() => (resumeId ? 'pay' : 'offer'));
  const [order, setOrder] = useState<ServiceOrder | null>(() =>
    resumeId ? getServiceOrder(resumeId) : null,
  );

  const service = LAUNCH_PACK;
  const serviceId = LAUNCH_PACK.id;

  const [projectName, setProjectName] = useState('');
  const [ticker, setTicker] = useState(() => params.get('ticker')?.trim() ?? '');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [telegram, setTelegram] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [bannerDataUrl, setBannerDataUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const canSubmitForm = useMemo(() => {
    return projectName.trim().length > 1 && email.includes('@');
  }, [projectName, email]);

  const startOrder = () => {
    setError(null);
    if (!canSubmitForm) {
      setError('Project name and a valid email are required.');
      return;
    }
    const draft = createServiceOrderDraft({
      serviceId,
      priceSol: service.priceSol,
      projectName: projectName.trim(),
      ticker: ticker.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      telegram: telegram.trim() || undefined,
      xHandle: xHandle.trim() || undefined,
      email: email.trim(),
      notes: notes.trim() || undefined,
      logoDataUrl,
      bannerDataUrl,
    });
    setOrder(draft);
    setStep('pay');
    navigate(`/advertise?order=${draft.id}`, { replace: true });
  };

  const completePayment = async () => {
    if (!order) return;
    setError(null);
    if (!connected) {
      const next = await connect();
      if (!next) {
        setError('Connect your Solana wallet to pay for Advertise services.');
        return;
      }
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, 900));
    const paid = markServiceOrderPaid(order.id);
    setPaying(false);
    if (!paid) {
      setError('Payment failed — try again.');
      return;
    }
    setOrder(paid);
    setStep('done');
  };

  return (
    <AppShell>
    <div className="min-h-screen bg-black text-[#f5f7fb]">
      <header className="border-b border-white/[0.07] bg-black">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 pl-14 md:pl-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <p className="font-serif text-base font-bold">Advertise</p>
          <Link to="/fees" className="text-sm text-[#c8ff3d] hover:text-[#d5ff69]">
            Fees
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        {step === 'offer' && (
          <section className="space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                Grow on CTOgo
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Advertise</h1>
              <p className="mt-2 max-w-xl text-sm text-white/45">
                Launch creatives to ship with — site, logo, banner, and a CTOgo channel callout. Pay
                with SOL.
              </p>
            </div>

            <article className="overflow-hidden rounded-2xl border border-[#c8ff3d]/25 bg-gradient-to-b from-[#c8ff3d]/10 to-transparent">
              <div className="border-b border-white/[0.06] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#d5ff69]">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold">{service.title}</h2>
                      <p className="mt-0.5 text-xs text-white/45">{service.tagline}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#c8ff3d] px-2.5 py-1 text-[11px] font-bold text-[#090b14]">
                    {formatSolPrice(service.priceSol)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#c8ff3d]/80">
                    Included
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-white/75">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c8ff3d]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                    Not included
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {service.excludes.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-white/40">
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-white/[0.06] p-5">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14] hover:bg-[#d5ff69] sm:w-auto"
                >
                  Continue · {formatSolPrice(service.priceSol)}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          </section>
        )}

        {step === 'form' && (
          <section className="space-y-5">
            <button
              type="button"
              onClick={() => setStep('offer')}
              className="inline-flex items-center gap-1 text-sm text-white/45 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold">Order details</h1>
              <p className="mt-1 text-xs text-white/40">
                Tell us what to build. You pay {formatSolPrice(service.priceSol)} on the next step.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <Field label="Project / coin name *" value={projectName} onChange={setProjectName} placeholder="Moon Pigeon" />
              <Field label="Ticker" value={ticker} onChange={setTicker} placeholder="MPEG" />
              <Field
                label="Old website URL"
                value={websiteUrl}
                onChange={setWebsiteUrl}
                placeholder="https://old-site.com"
                icon={Globe}
              />
              <Field label="Telegram" value={telegram} onChange={setTelegram} placeholder="https://t.me/..." />
              <Field label="X / Twitter" value={xHandle} onChange={setXHandle} placeholder="@handle" />
              <Field
                label="Email *"
                value={email}
                onChange={setEmail}
                placeholder="you@email.com"
                icon={Mail}
                type="email"
              />
              <label className="block text-xs font-medium text-white/45">
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything we should know about the clone or branding…"
                  className={`${inputClass} mt-1.5 resize-y`}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <UploadSlot
                  label="Logo (optional)"
                  imageUrl={logoDataUrl}
                  onClear={() => setLogoDataUrl(null)}
                  onPick={() => logoRef.current?.click()}
                />
                <UploadSlot
                  label="Banner (optional)"
                  imageUrl={bannerDataUrl}
                  wide
                  onClear={() => setBannerDataUrl(null)}
                  onPick={() => bannerRef.current?.click()}
                />
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setLogoDataUrl(await readImageFile(file));
                  } catch {
                    setError('Logo upload failed');
                  }
                  e.target.value = '';
                }}
              />
              <input
                ref={bannerRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setBannerDataUrl(await readImageFile(file));
                  } catch {
                    setError('Banner upload failed');
                  }
                  e.target.value = '';
                }}
              />
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="button"
              disabled={!canSubmitForm}
              onClick={startOrder}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14] hover:bg-[#d5ff69] disabled:opacity-40 sm:w-auto"
            >
              Continue to payment
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {step === 'pay' && order && (
          <section className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl font-bold">Pay with SOL</h1>
              <p className="mt-1 text-xs text-white/40">
                Direct checkout for <span className="text-white">{order.projectName}</span> — not from a
                marketing wallet.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#c8ff3d]" />
                  <span className="text-sm font-medium">{service.title}</span>
                </div>
                <span className="font-serif text-2xl font-bold text-[#c8ff3d]">
                  {formatSolPrice(order.priceSol)}
                </span>
              </div>
              <dl className="mt-4 space-y-1.5 text-xs text-white/45">
                <div className="flex justify-between gap-2">
                  <dt>Email</dt>
                  <dd className="text-white/80">{order.email}</dd>
                </div>
                {order.websiteUrl ? (
                  <div className="flex justify-between gap-2">
                    <dt>Site to clone</dt>
                    <dd className="truncate text-white/80">{order.websiteUrl}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-100/80">
                Paying for Advertise requires a connected Solana wallet. Live on-chain transfer wiring
                comes next.
                {connected && address
                  ? ` Paying as ${address.slice(0, 4)}…${address.slice(-4)}.`
                  : ''}
              </p>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="button"
              disabled={paying || walletBusy}
              onClick={() => void completePayment()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14] hover:bg-[#d5ff69] disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" />
              {paying
                ? 'Confirming…'
                : connected
                  ? `Pay ${formatSolPrice(order.priceSol)}`
                  : `Connect wallet & pay ${formatSolPrice(order.priceSol)}`}
            </button>
          </section>
        )}

        {step === 'done' && order && (
          <section className="space-y-5 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#c8ff3d]/15 text-[#c8ff3d]">
              <Check className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Payment received</h1>
              <p className="mt-2 text-sm text-white/45">
                Your launch pack for <span className="text-white">{order.projectName}</span> is in the
                queue. Track delivery and submit site change requests from your dashboard.
              </p>
              {order.paymentRef ? (
                <p className="mt-2 text-[11px] text-white/30">Ref {order.paymentRef}</p>
              ) : null}
            </div>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                to="/dashboard?tab=services"
                className="inline-flex items-center justify-center rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14]"
              >
                Open dashboard
              </Link>
              <Link
                to="/get-started"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 hover:text-white"
              >
                Launch a CTO next
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: typeof Mail;
  type?: string;
}) {
  return (
    <label className="block text-xs font-medium text-white/45">
      {label}
      <span className="relative mt-1.5 block">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${Icon ? 'pl-9' : ''}`}
        />
      </span>
    </label>
  );
}

function UploadSlot({
  label,
  imageUrl,
  wide,
  onClear,
  onPick,
}: {
  label: string;
  imageUrl: string | null;
  wide?: boolean;
  onClear: () => void;
  onPick: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="mb-2 text-[11px] text-white/40">{label}</p>
      {imageUrl ? (
        <div className={`relative overflow-hidden rounded-md ${wide ? 'aspect-[3/1]' : 'aspect-square max-w-[7rem]'}`}>
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/55"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      )}
    </div>
  );
}
