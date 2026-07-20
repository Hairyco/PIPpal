import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Wallet } from 'lucide-react';
import { TRADE_FEE_LABEL } from '../data/chainConfig';

type LaunchMode = 'launch' | 'add';

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

export function LaunchCtoPage() {
  const [mode, setMode] = useState<LaunchMode>('launch');
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [contract, setContract] = useState('');
  const [telegram, setTelegram] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
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

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('launch');
                setSubmitted(false);
              }}
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
              onClick={() => {
                setMode('add');
                setSubmitted(false);
              }}
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
                    Every launch creates a dedicated wallet. {TRADE_FEE_LABEL} on trades fills it.
                    When the balance hits a threshold, ads buy themselves (Telegram, DexScreener,
                    and more) — no upfront media budget.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white/80">Already a CTO?</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                Paste the mint address and community link. If it has no marketing wallet yet, you
                can enable one after listing.
              </p>
            </div>
          )}

          {submitted ? (
            <div className="mt-6 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-5 text-center">
              <p className="text-sm font-bold text-[#d5ff69]">Submitted</p>
              <p className="mt-1 text-xs text-white/50">
                We&apos;ll review {ticker ? `$${ticker.toUpperCase()}` : 'your project'} shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setTicker('');
                  setContract('');
                  setTelegram('');
                  setNote('');
                }}
                className="mt-4 text-xs font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Project name</span>
                <input
                  required
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
                    required
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
                  {mode === 'add' ? 'Mint / contract address' : 'Contract address (if known)'}
                </span>
                <input
                  required={mode === 'add'}
                  value={contract}
                  onChange={(event) => setContract(event.target.value)}
                  placeholder="So1111… or paste mint"
                  className={`${fieldClass} font-mono text-[12px]`}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Telegram</span>
                <input
                  required
                  value={telegram}
                  onChange={(event) => setTelegram(event.target.value)}
                  placeholder="https://t.me/…"
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
                  className="mt-1.5 w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                />
              </label>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                {mode === 'launch' ? 'Launch CTO' : 'Add coin'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
