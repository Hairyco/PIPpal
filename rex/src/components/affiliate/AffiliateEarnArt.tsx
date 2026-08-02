/** Decorative referral / forever-earn art for the affiliate promo sheet. */
export function AffiliateEarnArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="affGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#a8e63a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6bcb1f" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="affSoft" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c8ff3d" stopOpacity="0" />
        </linearGradient>
        <filter id="affBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <ellipse cx="160" cy="138" rx="118" ry="16" fill="url(#affSoft)" />

      {/* Forever orbit ring */}
      <ellipse
        cx="160"
        cy="78"
        rx="78"
        ry="42"
        stroke="#c8ff3d"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <ellipse
        cx="160"
        cy="78"
        rx="78"
        ry="42"
        stroke="#c8ff3d"
        strokeOpacity="0.12"
        strokeWidth="6"
        filter="url(#affBlur)"
      />

      {/* Left referrer node */}
      <g transform="translate(54,58)">
        <circle cx="22" cy="18" r="18" fill="#c8ff3d" fillOpacity="0.12" />
        <circle cx="22" cy="18" r="18" stroke="#c8ff3d" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle cx="22" cy="12" r="5.5" fill="url(#affGlow)" />
        <path
          d="M10 30c2.5-7 8-10 12-10s9.5 3 12 10"
          stroke="#c8ff3d"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>

      {/* Right trader node */}
      <g transform="translate(222,58)">
        <circle cx="22" cy="18" r="18" fill="#c8ff3d" fillOpacity="0.12" />
        <circle cx="22" cy="18" r="18" stroke="#c8ff3d" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle cx="22" cy="12" r="5.5" fill="url(#affGlow)" />
        <path
          d="M10 30c2.5-7 8-10 12-10s9.5 3 12 10"
          stroke="#c8ff3d"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>

      {/* Center fee bolt / reward */}
      <g transform="translate(128,28)">
        <path
          d="M40 6 L18 48 H36 L28 92 L64 40 H46 L54 6 Z"
          fill="#c8ff3d"
          filter="url(#affBlur)"
          opacity="0.55"
        />
        <path d="M40 6 L18 48 H36 L28 92 L64 40 H46 L54 6 Z" fill="url(#affGlow)" />
      </g>

      {/* Flow arrows */}
      <path
        d="M98 76 C112 62, 120 62, 132 70"
        stroke="#c8ff3d"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M188 70 C200 62, 208 62, 222 76"
        stroke="#c8ff3d"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />

      {/* 0.50% chip */}
      <g transform="translate(124,118)">
        <rect width="72" height="22" rx="7" fill="#c8ff3d" fillOpacity="0.15" />
        <rect width="72" height="22" rx="7" stroke="#c8ff3d" strokeOpacity="0.45" />
        <text
          x="36"
          y="15"
          textAnchor="middle"
          fill="#d5ff69"
          fontSize="11"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          0.50%
        </text>
      </g>

      <circle cx="48" cy="42" r="2.5" fill="#c8ff3d" opacity="0.85" />
      <circle cx="272" cy="48" r="2" fill="#c8ff3d" opacity="0.7" />
      <circle cx="250" cy="24" r="1.5" fill="#fff" opacity="0.45" />
      <circle cx="70" cy="110" r="1.5" fill="#fff" opacity="0.35" />
    </svg>
  );
}
