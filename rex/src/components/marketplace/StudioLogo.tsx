import type { FC } from 'react';
import type { DevStudio } from '../../data/devStudios';

type LogoProps = { className?: string };

function PixelForgeLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#0f172a" />
      <rect x="14" y="14" width="14" height="14" fill="#3b82f6" />
      <rect x="30" y="14" width="14" height="14" fill="#60a5fa" />
      <rect x="46" y="14" width="14" height="14" fill="#3b82f6" opacity="0.6" />
      <rect x="14" y="30" width="14" height="14" fill="#60a5fa" opacity="0.7" />
      <rect x="30" y="30" width="14" height="14" fill="#f97316" />
      <rect x="46" y="30" width="14" height="14" fill="#fb923c" />
      <rect x="22" y="46" width="14" height="14" fill="#f97316" />
      <rect x="38" y="46" width="14" height="14" fill="#fdba74" />
      <path d="M30 58 L40 48 L50 58 L40 66 Z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function NovaLabsLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <defs>
        <linearGradient id="nova-bg" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="nova-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#nova-bg)" />
      <circle cx="40" cy="36" r="28" fill="url(#nova-glow)" />
      <path
        d="M40 14 L44 30 L60 34 L44 38 L40 54 L36 38 L20 34 L36 30 Z"
        fill="#fff"
      />
      <circle cx="40" cy="34" r="4" fill="#ddd6fe" />
      <text x="40" y="68" textAnchor="middle" fill="#e9d5ff" fontSize="9" fontWeight="700" fontFamily="system-ui,sans-serif" letterSpacing="2">
        NOVA
      </text>
    </svg>
  );
}

function StacklineLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#312e81" />
      <rect x="16" y="22" width="48" height="8" rx="4" fill="#fff" opacity="0.35" />
      <rect x="16" y="34" width="48" height="8" rx="4" fill="#fff" opacity="0.65" />
      <rect x="16" y="46" width="48" height="8" rx="4" fill="#fff" />
      <path d="M52 18 L58 24 L52 30" stroke="#818cf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="40" y="66" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1.5">
        STACKLINE
      </text>
    </svg>
  );
}

function ArcadeWorksLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#083344" />
      <rect x="18" y="28" width="44" height="30" rx="6" fill="#06b6d4" />
      <rect x="22" y="32" width="36" height="18" rx="3" fill="#0e7490" />
      <circle cx="30" cy="50" r="4" fill="#ecfeff" />
      <circle cx="46" cy="46" r="5" fill="none" stroke="#ecfeff" strokeWidth="2.5" />
      <rect x="36" y="16" width="8" height="14" rx="4" fill="#22d3ee" />
      <circle cx="40" cy="14" r="5" fill="#f0fdff" />
      <text x="40" y="70" textAnchor="middle" fill="#67e8f9" fontSize="7.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">
        ARCADE
      </text>
    </svg>
  );
}

function PrismUiLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <defs>
        <linearGradient id="prism-bg" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#prism-bg)" />
      <path d="M40 16 L58 52 H22 Z" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 24 L52 48 H28 Z" fill="#99f6e4" opacity="0.85" />
      <path d="M40 24 L46 48 H34 Z" fill="#fff" opacity="0.9" />
      <line x1="40" y1="16" x2="40" y2="52" stroke="#ccfbf1" strokeWidth="1" opacity="0.5" />
      <text x="40" y="66" textAnchor="middle" fill="#ccfbf1" fontSize="8" fontWeight="700" fontFamily="system-ui,sans-serif" letterSpacing="2">
        PRISM
      </text>
    </svg>
  );
}

function ChainCraftLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#064e3b" />
      <ellipse cx="28" cy="38" rx="14" ry="10" fill="none" stroke="#34d399" strokeWidth="4" />
      <ellipse cx="52" cy="38" rx="14" ry="10" fill="none" stroke="#6ee7b7" strokeWidth="4" />
      <rect x="36" y="34" width="8" height="8" rx="1" fill="#a7f3d0" transform="rotate(45 40 38)" />
      <path d="M22 48 L28 54 L34 48" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M46 48 L52 54 L58 48" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="40" y="66" textAnchor="middle" fill="#a7f3d0" fontSize="7" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">
        CHAINCRAFT
      </text>
    </svg>
  );
}

function OrbitDigitalLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#1c1917" />
      <ellipse cx="40" cy="38" rx="26" ry="10" fill="none" stroke="#f59e0b" strokeWidth="2.5" transform="rotate(-20 40 38)" />
      <ellipse cx="40" cy="38" rx="26" ry="10" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5" transform="rotate(30 40 38)" />
      <circle cx="40" cy="38" r="10" fill="#f59e0b" />
      <circle cx="40" cy="38" r="6" fill="#fcd34d" />
      <circle cx="58" cy="30" r="3" fill="#fff" />
      <text x="40" y="66" textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1.5">
        ORBIT
      </text>
    </svg>
  );
}

function VertexGamesLogo({ className = 'h-full w-full' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <defs>
        <linearGradient id="vertex-bg" x1="0" y1="80" x2="80" y2="0">
          <stop offset="0%" stopColor="#831843" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="16" fill="url(#vertex-bg)" />
      <path d="M18 58 L40 18 L62 58 Z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 48 H54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="36" r="3" fill="#fce7f3" />
      <text x="40" y="70" textAnchor="middle" fill="#fce7f3" fontSize="7.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1.5">
        VERTEX
      </text>
    </svg>
  );
}

const LOGOS: Record<string, FC<LogoProps>> = {
  'pixel-forge': PixelForgeLogo,
  'nova-labs': NovaLabsLogo,
  stackline: StacklineLogo,
  'arcade-works': ArcadeWorksLogo,
  'prism-ui': PrismUiLogo,
  chaincraft: ChainCraftLogo,
  'orbit-digital': OrbitDigitalLogo,
  'vertex-games': VertexGamesLogo,
};

export function StudioLogo({
  studio,
  size = 'lg',
}: {
  studio: Pick<DevStudio, 'id' | 'initials' | 'color' | 'name'>;
  size?: 'md' | 'lg';
}) {
  const Logo = LOGOS[studio.id];
  const dim = size === 'lg' ? 'h-14 w-14 sm:h-20 sm:w-20' : 'h-10 w-10';

  return (
    <div
      className={`${dim} shrink-0 overflow-hidden rounded-2xl ring-4 ring-[#0a0e17] shadow-lg`}
      title={studio.name}
      aria-label={`${studio.name} logo`}
    >
      {Logo ? <Logo /> : (
        <div
          className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: studio.color }}
        >
          {studio.initials}
        </div>
      )}
    </div>
  );
}

export function StudioLogoBadge({
  studio,
}: {
  studio: Pick<DevStudio, 'id' | 'initials' | 'color' | 'name'>;
}) {
  return <StudioLogo studio={studio} size="md" />;
}
