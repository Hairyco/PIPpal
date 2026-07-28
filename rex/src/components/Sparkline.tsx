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
 */
function buildSeries(seed: string, changePct: number | null, points = 18): number[] {
  const positive = (changePct ?? 0) >= 0;
  let t = hashSeed(seed);
  const rand = () => {
    t = (t * 16807 + 0.123456789) % 1;
    return t;
  };

  const values: number[] = [];
  let v = 0.45 + rand() * 0.15;
  const drift = positive ? 0.012 : -0.012;
  const magnitude = Math.min(0.04, Math.abs(changePct ?? 5) / 400);

  for (let i = 0; i < points; i += 1) {
    const noise = (rand() - 0.5) * 0.08;
    v = Math.max(0.08, Math.min(0.92, v + drift + noise + (positive ? magnitude : -magnitude)));
    values.push(v);
  }

  // Anchor end higher/lower so colour matches the % column
  const endBias = positive ? 0.12 : -0.12;
  values[values.length - 1] = Math.max(
    0.08,
    Math.min(0.92, values[values.length - 1] + endBias),
  );
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
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
