import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  MessageCircle,
  Share2,
  Wallet,
} from 'lucide-react';
import { useConnectedWallet } from './ConnectWalletButton';
import { buildScoutLink } from '../utils/scoutReferral';

type CommunityDetails = {
  website: string;
  telegram: string;
  twitter: string;
};

type Props = {
  mode: 'launch' | 'add';
  symbol: string;
  logoUrl?: string | null;
  initialWebsite?: string;
  initialTelegram?: string;
  initialTwitter?: string;
  onContinue: (details: CommunityDetails) => void;
};

function XGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const fieldClass =
  'h-11 w-full rounded-xl border border-white/[0.1] bg-[#1c1c1e] px-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#c8ff3d]/45';

export function PostSuccessCommunitySetup({
  mode,
  symbol,
  logoUrl,
  initialWebsite = '',
  initialTelegram = '',
  initialTwitter = '',
  onContinue,
}: Props) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const [website, setWebsite] = useState(initialWebsite);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState<'link' | 'copy' | null>(null);

  const ticker = symbol.replace(/^\$/, '').trim().toUpperCase() || 'CTO';
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
  const earningLink = address ? buildScoutLink(origin, ticker, address) : null;
  const isLaunch = mode === 'launch';

  const communityCopy = useMemo(
    () =>
      earningLink
        ? `Trade $${ticker} on CTOgo: ${earningLink}\n\nUse this link to buy and support our community growth.`
        : '',
    [earningLink, ticker],
  );

  const copyText = async (kind: 'link' | 'copy') => {
    const value = kind === 'link' ? earningLink : communityCopy;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  const shareLink = async () => {
    if (!earningLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `$${ticker} on CTOgo`,
          text: `Trade $${ticker} and support the community`,
          url: earningLink,
        });
        return;
      } catch {
        /* fall back to copy */
      }
    }
    await copyText('link');
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-[#c8ff3d]/25 bg-gradient-to-br from-[#c8ff3d]/12 via-[#121214] to-[#121214] p-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-12 w-12 rounded-xl border border-white/[0.12] object-cover"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.1] bg-black/25 text-sm font-bold text-[#d5ff69]">
              {ticker.slice(0, 2)}
            </span>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c8ff3d]">
              {isLaunch ? 'Launch complete' : 'Listed on CTOgo'}
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white">
              Set up ${ticker} for growth
            </h1>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-white/55">
          Add your official channels, then publish the attributed CTOgo link where your community
          can find it.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200">
          How fee collection works
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/70">
          {isLaunch
            ? 'Fees and marketing-wallet fill continue on trades routed through the CTOgo terminal after Raydium graduation. Share your CTOgo link—not a bare contract address—to retain raid attribution.'
            : 'The marketing wallet only accumulates from trades made through CTOgo. Volume on Pump, Jupiter, Trojan, Raydium, or other interfaces does not fund it.'}
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[12px] text-white/55">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#c8ff3d]"
          />
          I understand which trades fund the marketing wallet.
        </label>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#121214] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">
              {isLaunch ? 'Earn up to 0.70% from your link' : 'Earn 0.50% from your link'}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/45">
              {isLaunch
                ? '0.20% creator fee + 0.50% attributed raid fee on CTOgo-routed trades.'
                : 'Anyone can raid this token. The 0.50% raid fee goes to the attributed wallet.'}
            </p>
          </div>
          <span className="rounded-lg bg-[#c8ff3d] px-2 py-1 text-[11px] font-bold text-[#090b14]">
            {isLaunch ? '0.70%' : '0.50%'}
          </span>
        </div>

        {!connected || !earningLink ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void connect()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 text-[13px] font-bold text-[#090b14] hover:bg-[#d5ff69] disabled:opacity-50"
          >
            <Wallet className="h-4 w-4" />
            {busy ? 'Connecting…' : 'Connect wallet to create your earning link'}
          </button>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/25 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Your attributed CTOgo link
              </p>
              <p className="mt-1.5 break-all font-mono text-[11px] text-white/70">{earningLink}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copyText('link')}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#c8ff3d] px-3 text-[12px] font-bold text-[#090b14]"
              >
                {copied === 'link' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'link' ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={() => void shareLink()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] text-[12px] font-semibold text-white/70 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#121214] p-4">
        <p className="text-sm font-bold text-white">Official community channels</p>
        <p className="mt-1 text-[12px] text-white/45">
          Add links now or finish them later from Dashboard → Socials.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-white/55">
              <Globe className="h-3.5 w-3.5" /> Website
            </span>
            <div className="flex gap-2">
              <input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://yourcoin.com"
                className={fieldClass}
              />
              {website.trim() ? (
                <a
                  href={website.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.1] text-white/55"
                  aria-label="Open website"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-white/55">
              <img src="/images/partners/telegram.svg" alt="" className="h-4 w-4" /> Telegram
            </span>
            <div className="flex gap-2">
              <input
                value={telegram}
                onChange={(event) => setTelegram(event.target.value)}
                placeholder="https://t.me/yourcoin"
                className={fieldClass}
              />
              {telegram.trim() ? (
                <a
                  href={telegram.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.1] text-[#2AABEE]"
                  aria-label="Open Telegram"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-white/55">
              <XGlyph className="h-3.5 w-3.5" /> X account
            </span>
            <input
              value={twitter}
              onChange={(event) => setTwitter(event.target.value)}
              placeholder="https://x.com/yourcoin"
              className={fieldClass}
            />
          </label>
          <a
            href={twitter.trim() || 'https://x.com/i/flow/signup'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d5ff69] hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {twitter.trim() ? 'Open X profile' : 'Create a free X account'}
          </a>
        </div>
      </section>

      {earningLink ? (
        <section className="rounded-2xl border border-white/[0.08] bg-[#121214] p-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#d5ff69]" />
            <p className="text-sm font-bold text-white">Put this in your community header</p>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
            Add the full CTOgo link to your X bio and Telegram description or pinned message.
          </p>
          <div className="mt-3 whitespace-pre-wrap rounded-xl border border-white/[0.08] bg-black/25 p-3 text-[12px] leading-relaxed text-white/65">
            {communityCopy}
          </div>
          <button
            type="button"
            onClick={() => void copyText('copy')}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/[0.08] text-[12px] font-bold text-[#d5ff69]"
          >
            {copied === 'copy' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === 'copy' ? 'Copied' : 'Copy channel text'}
          </button>
        </section>
      ) : null}

      <button
        type="button"
        disabled={!acknowledged}
        onClick={() =>
          onContinue({
            website: website.trim(),
            telegram: telegram.trim(),
            twitter: twitter.trim(),
          })
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c8ff3d] text-[13px] font-bold text-[#090b14] hover:bg-[#d5ff69] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to dashboard
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
