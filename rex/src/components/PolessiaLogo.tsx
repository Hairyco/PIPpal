type PolessiaLogoProps = {
  className?: string;
  /** mark only | wordmark with mark | compact powered-by row */
  variant?: 'mark' | 'full' | 'powered';
  size?: 'sm' | 'md';
};

/**
 * Polessia — autonomous marketing / vault spend brand.
 * CTOgo surfaces this as the funnel; Polessia is the product.
 */
export function PolessiaLogo({
  className = '',
  variant = 'full',
  size = 'md',
}: PolessiaLogoProps) {
  const markPx = size === 'sm' ? 22 : 28;
  const wordClass =
    size === 'sm'
      ? 'text-[13px] tracking-[-0.02em]'
      : 'text-[15px] tracking-[-0.02em]';

  const mark = (
    <img
      src="/images/brands/polessia-mark.png"
      alt=""
      width={markPx}
      height={markPx}
      className="shrink-0 rounded-[6px]"
      draggable={false}
    />
  );

  if (variant === 'mark') {
    return (
      <span className={`inline-flex ${className}`} aria-label="Polessia">
        {mark}
      </span>
    );
  }

  if (variant === 'powered') {
    return (
      <span
        className={`inline-flex items-center gap-2 text-white/45 ${className}`}
        aria-label="Powered by Polessia"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.14em]">Powered by</span>
        <span className="inline-flex items-center gap-1.5">
          {mark}
          <span className={`font-semibold text-white/85 ${wordClass}`}>Polessia</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Polessia">
      {mark}
      <span className={`font-semibold text-white ${wordClass}`}>Polessia</span>
    </span>
  );
}
