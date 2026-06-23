import { useMemo } from 'react';
import type { ChartPoint, WalletChartMilestone } from '../../data/walletChart';

const CHART_HEIGHT = 260;
const PADDING = { top: 20, right: 120, bottom: 32, left: 48 };

function buildPath(points: ChartPoint[], maxY: number, width: number): string {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return points
    .map((p, i) => {
      const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * innerW;
      const y = PADDING.top + innerH - (p.value / maxY) * innerH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

function buildArea(points: ChartPoint[], maxY: number, width: number): string {
  const line = buildPath(points, maxY, width);
  const innerW = width - PADDING.left - PADDING.right;
  const baseY = CHART_HEIGHT - PADDING.bottom;
  const lastX = PADDING.left + innerW;
  return `${line} L${lastX},${baseY} L${PADDING.left},${baseY} Z`;
}

interface MarketingWalletChartProps {
  history: ChartPoint[];
  milestones: WalletChartMilestone[];
  currentBalance: number;
}

export function MarketingWalletChart({
  history,
  milestones,
  currentBalance,
}: MarketingWalletChartProps) {
  const width = 640;

  const maxY = useMemo(() => {
    const peak = Math.max(currentBalance, ...milestones.map((m) => m.amount));
    return peak * 1.15;
  }, [currentBalance, milestones]);

  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const innerW = width - PADDING.left - PADDING.right;

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="min-w-[320px] w-full"
        role="img"
        aria-label="Marketing wallet balance with ad spend milestones"
      >
        {yTicks.map((tick) => {
          const y = PADDING.top + innerH - (tick / maxY) * innerH;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={width - PADDING.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                ${tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {milestones.map((milestone) => {
          const y = PADDING.top + innerH - (milestone.amount / maxY) * innerH;
          const stroke =
            milestone.status === 'completed'
              ? '#34d399'
              : milestone.status === 'active'
                ? '#38bdf8'
                : 'rgba(255,255,255,0.2)';

          return (
            <g key={milestone.id}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={width - PADDING.right}
                y2={y}
                stroke={stroke}
                strokeWidth={milestone.status === 'active' ? 2 : 1}
                strokeDasharray={milestone.status === 'upcoming' ? '6 4' : undefined}
                opacity={milestone.status === 'upcoming' ? 0.6 : 1}
              />
              <rect
                x={width - PADDING.right + 4}
                y={y - 10}
                width={108}
                height={20}
                rx={4}
                fill={
                  milestone.status === 'completed'
                    ? 'rgba(52,211,153,0.15)'
                    : milestone.status === 'active'
                      ? 'rgba(56,189,248,0.15)'
                      : 'rgba(255,255,255,0.05)'
                }
              />
              <text
                x={width - PADDING.right + 8}
                y={y + 4}
                className={`text-[9px] font-medium ${
                  milestone.status === 'completed'
                    ? 'fill-emerald-400'
                    : milestone.status === 'active'
                      ? 'fill-sky-400'
                      : 'fill-muted-foreground'
                }`}
              >
                ${milestone.amount.toLocaleString()} · {milestone.vendor}
              </text>
            </g>
          );
        })}

        <path d={buildArea(history, maxY, width)} fill="url(#walletGradient)" opacity={0.35} />
        <path
          d={buildPath(history, maxY, width)}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {history.map((point, i) => {
          if (i % 3 !== 0 && i !== history.length - 1) return null;
          const x = PADDING.left + (i / Math.max(history.length - 1, 1)) * innerW;
          return (
            <text
              key={point.label}
              x={x}
              y={CHART_HEIGHT - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {point.label}
            </text>
          );
        })}

        <defs>
          <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

interface PriceChartProps {
  history: ChartPoint[];
  change24h: number;
}

export function PriceChart({ history, change24h }: PriceChartProps) {
  const width = 640;
  const maxY = Math.max(...history.map((p) => p.value)) * 1.05;
  const minY = Math.min(...history.map((p) => p.value)) * 0.95;
  const range = maxY - minY || 1;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const innerW = width - PADDING.left - PADDING.right;
  const positive = change24h >= 0;
  const stroke = positive ? '#34d399' : '#f87171';

  const path = history
    .map((p, i) => {
      const x = PADDING.left + (i / Math.max(history.length - 1, 1)) * innerW;
      const y = PADDING.top + innerH - ((p.value - minY) / range) * innerH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${CHART_HEIGHT}`} className="min-w-[320px] w-full" role="img" aria-label="24 hour price chart">
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        {history.map((point, i) => {
          if (!point.label) return null;
          const x = PADDING.left + (i / Math.max(history.length - 1, 1)) * innerW;
          return (
            <text
              key={i}
              x={x}
              y={CHART_HEIGHT - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
