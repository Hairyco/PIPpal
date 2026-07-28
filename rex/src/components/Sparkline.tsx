import { useMemo } from 'react';

/** Deterministic 0–1 hash from a string (stable per ticker). */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * Build a short price path biased by recent change %.
 * Demo / offline-friendly — no paid market-data API.
 * Intentionally noisy so it reads like a real tape, not a smooth slope.
 */
function buildSeries(seed: string, changePct: number | null, points = 28): number[] {
  const positive = (changePct ?? 0) >= 0;
  const absChange = Math.abs(changePct ?? 5);
  let t = hashSeed(`${seed}:${absChange.toFixed(2)}`);
  const rand = () => {
    t = (t * 16807 + 0.123456789) % 1;
    return t;
  };

  const values: number[] = [];
  // Start mid-band; winners open a bit lower, losers a bit higher
  let v = positive ? 0.28 + rand() * 0.22 : 0.52 + rand() * 0.22;
  const drift = positive ? 0.006 + absChange / 2500 : -(0.006 + absChange / 2500);
  const volatility = 0.055 + Math.min(0.09, absChange / 180);

  for (let i = 0; i < points; i += 1) {
    // Fat-tailed steps: mostly small, sometimes a sharp tick
    const u = rand();
    const spike = u > 0.86 ? (rand() - 0.5) * volatility * 2.8 : (rand() - 0.5) * volatility;
    // Occasional brief counter-trend so the line zigzags
    const counter = u < 0.18 ? -drift * (1.4 + rand()) : 0;
    // Mild mean reversion keeps it on-canvas without flattening
    const pull = (0.5 - v) * 0.04;
    v = Math.max(0.06, Math.min(0.94, v + drift + spike + counter + pull));
    values.push(v);
  }

  // Soft end bias (no hard jump) so colour still matches the %
  const last = values[values.length - 1];
  const target = positive
    ? Math.max(last, 0.55 + rand() * 0.25)
    : Math.min(last, 0.45 - rand() * 0.25);
  values[values.length - 1] = last * 0.55 + target * 0.45;
  return values;
}

function toPath(values: number[], width: number, height: number): { line: string; area: string } {
  const step = width / Math.max(1, values.length - 1);
  const coords = values.map((v, i) => {
    const x = i * step;
    const y = height - v * height;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width.toFixed(1)} ${height} L0 ${height} Z`;
  return { line, area };
}

export function Sparkline({
  seed,
  changePct,
  width = 72,
  height = 28,
  className = '',
}: {
  seed: string;
  changePct: number | null | undefined;
  width?: number;
  height?: number;
  className?: string;
}) {
  const positive = (changePct ?? 0) >= 0;
  const { line, area } = useMemo(() => {
    const series = buildSeries(seed, changePct ?? 0);
    return toPath(series, width, height);
  }, [seed, changePct, width, height]);

  const stroke = positive ? '#86efac' : '#fb7185';
  const fillId = `spark-${seed.replace(/[^a-zA-Z0-9]/g, '')}-${positive ? 'up' : 'dn'}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.35"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
