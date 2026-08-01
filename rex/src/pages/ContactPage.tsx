import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { CLONE_HOSTING_FEE_SOL } from '../data/claimPricing';

const SUPPORT_EMAIL = 'hello@ctogo.app';

const CHANNELS = [
  {
    id: 'telegram',
    label: 'Telegram',
    detail: 'Fastest route for launch, raid, and marketing wallet questions.',
    action: '@ctogo',
    href: 'https://t.me/ctogo',
    icon: MessageCircle,
    external: true,
  },
  {
    id: 'email',
    label: 'Email',
    detail: 'Suppliers, partnerships, and anything that needs a paper trail.',
    action: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    icon: Mail,
    external: false,
  },
  {
    id: 'x',
    label: 'X / Twitter',
    detail: 'Announcements, trending pushes, and takeover callouts.',
    action: '@ctogo',
    href: 'https://x.com/ctogo',
    icon: ExternalLink,
    external: true,
  },
] as const;

const TOPICS = [
  {
    id: 'listing',
    label: 'Get a coin listed',
    detail: 'Submit it from the Launch page first — then message us if it needs review.',
    to: '/launch',
    cta: 'Launch a CTO',
  },
  {
    id: 'supplier',
    label: 'Become a supplier',
    detail: 'Marketing, design, and dev shops paid from marketing wallets.',
    to: '/become-a-supplier',
    cta: 'Apply',
  },
  {
    id: 'promote',
    label: 'Advertise or promote',
    detail: 'Board boosts and launch creatives — pay with SOL or marketing wallet.',
    to: '/advertise',
    cta: 'Advertise',
  },
] as const;

const REQUEST_TYPES = [
  { id: 'general', label: 'General question' },
  { id: 'website', label: 'Website changes' },
  { id: 'marketing', label: 'Marketing wallet' },
  { id: 'listing', label: 'Listing / launch' },
  { id: 'other', label: 'Other' },
] as const;

type RequestType = (typeof REQUEST_TYPES)[number]['id'];

const WEBSITE_CHANGE_OPTIONS = [
  { id: 'own', label: 'Own site — update URL' },
  { id: 'clone', label: 'Clone on CTOgo' },
  { id: 'none', label: 'Remove website' },
  { id: 'other', label: 'Other website request' },
] as const;

type WebsiteChangeKind = (typeof WEBSITE_CHANGE_OPTIONS)[number]['id'];

const MARKETING_QUERY_OPTIONS = [
  { id: 'pause', label: 'Pause / unpause spend' },
  { id: 'balance', label: 'Balance or fill issue' },
  { id: 'manual', label: 'Manual payment / pay-in' },
  { id: 'address', label: 'Wallet address / Solscan' },
  { id: 'spend', label: 'Auto spend not running' },
  { id: 'other', label: 'Other marketing wallet question' },
] as const;

type MarketingQueryKind = (typeof MARKETING_QUERY_OPTIONS)[number]['id'];

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const initialType = useMemo<RequestType>(() => {
    if (topicParam && REQUEST_TYPES.some((t) => t.id === topicParam)) {
      return topicParam as RequestType;
    }
    return 'general';
  }, [topicParam]);

  const [requestType, setRequestType] = useState<RequestType>(initialType);
  const [websiteChange, setWebsiteChange] = useState<WebsiteChangeKind>('own');
  const [marketingQuery, setMarketingQuery] = useState<MarketingQueryKind>('pause');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ticker, setTicker] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const isWebsite = requestType === 'website';
  const isMarketing = requestType === 'marketing';

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const subject = isWebsite
      ? `Website changes · $${ticker.trim() || 'CTO'} · ${
          WEBSITE_CHANGE_OPTIONS.find((o) => o.id === websiteChange)?.label ?? websiteChange
        }`
      : isMarketing
        ? `Marketing wallet · $${ticker.trim() || 'CTO'} · ${
            MARKETING_QUERY_OPTIONS.find((o) => o.id === marketingQuery)?.label ?? marketingQuery
          }`
        : `${REQUEST_TYPES.find((t) => t.id === requestType)?.label ?? 'Contact'} · $${
            ticker.trim() || 'CTO'
          }`;

    const body = [
      `Request: ${REQUEST_TYPES.find((t) => t.id === requestType)?.label ?? requestType}`,
      ticker.trim() ? `Ticker: $${ticker.trim().toUpperCase()}` : null,
      email.trim() ? `Reply-to: ${email.trim()}` : null,
      isWebsite
        ? `Website change: ${
            WEBSITE_CHANGE_OPTIONS.find((o) => o.id === websiteChange)?.label ?? websiteChange
          }`
        : null,
      isWebsite && websiteUrl.trim() ? `Website URL: ${websiteUrl.trim()}` : null,
      isWebsite && websiteChange === 'clone'
        ? `Note: clone + hosting is ${CLONE_HOSTING_FEE_SOL} SOL from the marketing wallet`
        : null,
      isMarketing
        ? `Marketing query: ${
            MARKETING_QUERY_OPTIONS.find((o) => o.id === marketingQuery)?.label ?? marketingQuery
          }`
        : null,
      '',
      message.trim() || '(no message)',
    ]
      .filter((line) => line != null)
      .join('\n');

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Contact</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Talk to CTOgo</h1>
        <p className="mt-2 text-sm text-white/50">
          Check the FAQ first — most launch and marketing wallet questions are answered there.
          Website changes and marketing wallet queries are requested here.
        </p>

        <section className="mt-8 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <h2 className="text-sm font-semibold text-white/80">Send a request</h2>
          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold text-white/40">Topic</span>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RequestType)}
                className="w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8ff3d]/40"
              >
                {REQUEST_TYPES.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#0c0e16] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {isWebsite ? (
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold text-white/40">Website changes</span>
                <select
                  value={websiteChange}
                  onChange={(e) => setWebsiteChange(e.target.value as WebsiteChangeKind)}
                  className="w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8ff3d]/40"
                >
                  {WEBSITE_CHANGE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#0c0e16] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {isMarketing ? (
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold text-white/40">Marketing wallet query</span>
                <select
                  value={marketingQuery}
                  onChange={(e) => setMarketingQuery(e.target.value as MarketingQueryKind)}
                  className="w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8ff3d]/40"
                >
                  {MARKETING_QUERY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-[#0c0e16] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {isWebsite && (websiteChange === 'own' || websiteChange === 'clone') ? (
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold text-white/40">
                  {websiteChange === 'clone' ? 'Clone source URL' : 'Website URL'}
                </span>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
                />
                {websiteChange === 'clone' ? (
                  <p className="text-[11px] text-white/40">
                    {CLONE_HOSTING_FEE_SOL} SOL deducted from the marketing wallet for clone +
                    hosting.
                  </p>
                ) : null}
              </label>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold text-white/40">Ticker (optional)</span>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="e.g. MPEG"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold text-white/40">Your email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-semibold text-white/40">Message</span>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={
                  isWebsite
                    ? 'Describe the website change you need…'
                    : isMarketing
                      ? 'Describe your marketing wallet question…'
                      : 'How can we help?'
                }
                className="w-full resize-y rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#c8ff3d]/40"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 text-[13px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
            >
              {sent ? (
                <>
                  Opening mail
                  <Check className="h-4 w-4" />
                </>
              ) : (
                'Send request'
              )}
            </button>
            <p className="text-[11px] text-white/35">
              Opens your email app to {SUPPORT_EMAIL}. We never ask for seed phrases.
            </p>
          </form>
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">Channels</h2>
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.id}
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noreferrer' : undefined}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:border-[#c8ff3d]/30 hover:bg-white/[0.05]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#d5ff69]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white/85">{channel.label}</span>
                  <span className="block text-[11px] text-white/40">{channel.detail}</span>
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-[#c8ff3d]">
                  {channel.action}
                </span>
              </a>
            );
          })}
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">Common requests</h2>
          {TOPICS.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/85">{topic.label}</p>
                <p className="mt-0.5 text-[11px] text-white/40">{topic.detail}</p>
              </div>
              <Link
                to={topic.to}
                className="shrink-0 rounded-lg border border-white/[0.1] px-3 py-2 text-[11px] font-semibold text-white/70 hover:text-white"
              >
                {topic.cta}
              </Link>
            </div>
          ))}
        </section>

        <p className="mt-8 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-[12px] leading-relaxed text-white/45">
          CTOgo never DMs first and never asks for seed phrases or wallet approvals over chat. Verify
          marketing wallet balances on Solscan from the coin page before sending anything.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/faq"
            className="rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Read the FAQ
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
