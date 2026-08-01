type PolessiaLogoProps = {
  className?: string;
  /** mark only | wordmark with mark | compact powered-by row */
  variant?: 'mark' | 'full' | 'powered';
  size?: 'xs' | 'sm' | 'md';
};

/**
 * Polessia — autonomous marketing / wallet spend brand.
 * CTOgo surfaces this as the funnel; Polessia is the product.
 */
export function PolessiaLogo({
  className = '',
  variant = 'full',
  size = 'md',
}: PolessiaLogoProps) {
  const markPx = size === 'xs' ? 16 : size === 'sm' ? 22 : 28;
  const wordClass =
    size === 'xs'
      ? 'text-[11px] tracking-[-0.02em]'
      : size === 'sm'
        ? 'text-[13px] tracking-[-0.02em]'
        : 'text-[15px] tracking-[-0.02em]';
  const poweredLabelClass =
    size === 'xs' ? 'text-[9px] tracking-[0.12em]' : 'text-[10px] tracking-[0.14em]';

  const mark = (
    <img
      src="/images/brands/polessia-mark.png"
      alt=""
      width={markPx}
      height={markPx}
      className={`shrink-0 ${size === 'xs' ? 'rounded-[4px]' : 'rounded-[6px]'}`}
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
        className={`inline-flex items-center gap-1.5 text-white/45 sm:gap-2 ${className}`}
        aria-label="Powered by Polessia"
      >
        <span className={`font-medium uppercase ${poweredLabelClass}`}>Powered by</span>
        <span className="inline-flex items-center gap-1 sm:gap-1.5">
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
