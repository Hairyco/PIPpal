import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';

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

export function ContactPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Contact</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Talk to CTOgo</h1>
        <p className="mt-2 text-sm text-white/50">
          Check the FAQ first — most launch and marketing wallet questions are answered there.
        </p>

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
