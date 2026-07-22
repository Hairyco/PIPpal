/** Decorative lightning / energy art for the services promo sheet. */
export function LightningBundleArt({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="boltGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#a8e63a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6bcb1f" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="boltSoft" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#c8ff3d" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c8ff3d" stopOpacity="0" />
        </linearGradient>
        <filter id="boltBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="160" cy="130" rx="110" ry="18" fill="url(#boltSoft)" />

      {/* Left bolt */}
      <g opacity="0.55" transform="translate(28,18) scale(0.72)">
        <path
          d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z"
          fill="#c8ff3d"
          filter="url(#boltBlur)"
        />
        <path d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z" fill="url(#boltGlow)" />
      </g>

      {/* Center bolt */}
      <g transform="translate(95,4)">
        <path
          d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z"
          fill="#c8ff3d"
          filter="url(#boltBlur)"
          opacity="0.7"
        />
        <path d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z" fill="url(#boltGlow)" />
      </g>

      {/* Right bolt */}
      <g opacity="0.5" transform="translate(168,22) scale(0.68)">
        <path
          d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z"
          fill="#c8ff3d"
          filter="url(#boltBlur)"
        />
        <path d="M78 8 L42 78 H72 L58 148 L118 62 H84 L98 8 Z" fill="url(#boltGlow)" />
      </g>

      {/* Bundle option sparks */}
      <circle cx="52" cy="48" r="3" fill="#c8ff3d" opacity="0.9" />
      <circle cx="268" cy="56" r="2.5" fill="#c8ff3d" opacity="0.75" />
      <circle cx="240" cy="28" r="2" fill="#fff" opacity="0.5" />
      <circle cx="70" cy="100" r="1.5" fill="#fff" opacity="0.4" />
    </svg>
  );
}
