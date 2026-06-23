import { useMemo } from 'react';
import {
  BadgeCheck,
  BarChart3,
  Layout,
  Megaphone,
  Monitor,
  Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ChartPoint,
  ChartMilestoneMarker,
  MilestoneIcon,
  WalletChartMilestone,
} from '../../data/walletChart';
import { getChartMilestoneMarkers } from '../../data/walletChart';

const CHART_HEIGHT = 300;
const PADDING = { top: 28, right: 24, bottom: 36, left: 52 };

const MILESTONE_ICONS: Record<MilestoneIcon, LucideIcon> = {
  megaphone: Megaphone,
  badge: BadgeCheck,
  banner: Layout,
  display: Monitor,
  spotlight: BarChart3,
  rocket: Rocket,
};

function buildSmoothPath(points: ChartPoint[], maxY: number, width: number): string {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const coords = points.map((p, i) => ({
    x: PADDING.left + (i / Math.max(points.length - 1, 1)) * innerW,
    y: PADDING.top + innerH - (p.value / maxY) * innerH,
  }));

  if (coords.length < 2) return '';

  let path = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return path;
}

function buildArea(points: ChartPoint[], maxY: number, width: number): string {
  const line = buildSmoothPath(points, maxY, width);
  const innerW = width - PADDING.left - PADDING.right;
  const baseY = CHART_HEIGHT - PADDING.bottom;
  const lastX = PADDING.left + innerW;
  return `${line} L${lastX},${baseY} L${PADDING.left},${baseY} Z`;
}

function MilestoneDot({ marker }: { marker: ChartMilestoneMarker }) {
  const { milestone, x, y } = marker;
  const Icon = MILESTONE_ICONS[milestone.icon];
  const completed = milestone.status === 'completed';
  const active = milestone.status === 'active';

  return (
    <g>
      {active && (
        <circle cx={x} cy={y} r={16} fill="rgba(56,189,248,0.2)" className="animate-pulse" />
      )}
      <circle
        cx={x}
        cy={y}
        r={13}
        fill={completed ? '#065f46' : '#0c4a6e'}
        stroke={completed ? '#34d399' : '#38bdf8'}
        strokeWidth={2}
      />
      <foreignObject x={x - 8} y={y - 8} width={16} height={16}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="flex h-4 w-4 items-center justify-center"
        >
          <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
      </foreignObject>
      <title>
        {milestone.title} — ${milestone.amount.toLocaleString()} ({milestone.vendor})
      </title>
    </g>
  );
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
  const width = 680;

  const maxY = useMemo(() => {
    const peak = Math.max(currentBalance, ...milestones.map((m) => m.amount), ...history.map((p) => p.value));
    return peak * 1.12;
  }, [currentBalance, milestones, history]);

  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const innerW = width - PADDING.left - PADDING.right;

  const markers = useMemo(
    () => getChartMilestoneMarkers(history, milestones, maxY, width, CHART_HEIGHT, PADDING),
    [history, milestones, maxY],
  );

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];
  const lastPoint = history[history.length - 1];
  const lastX = PADDING.left + innerW;
  const lastY =
    PADDING.top + innerH - ((lastPoint?.value ?? 0) / maxY) * innerH;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="min-w-[340px] w-full"
        role="img"
        aria-label="Marketing wallet balance with ad spend milestones"
      >
        <defs>
          <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
                ${tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {milestones.map((milestone) => {
          const y = PADDING.top + innerH - (milestone.amount / maxY) * innerH;
          const stroke =
            milestone.status === 'completed'
              ? 'rgba(52,211,153,0.35)'
              : milestone.status === 'active'
                ? 'rgba(56,189,248,0.5)'
                : 'rgba(255,255,255,0.12)';

          return (
            <g key={milestone.id}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={width - PADDING.right}
                y2={y}
                stroke={stroke}
                strokeWidth={milestone.status === 'active' ? 1.5 : 1}
                strokeDasharray={milestone.status === 'upcoming' ? '5 4' : undefined}
              />
              <text
                x={width - PADDING.right}
                y={y - 4}
                textAnchor="end"
                className={`text-[9px] font-medium ${
                  milestone.status === 'completed'
                    ? 'fill-emerald-400/80'
                    : milestone.status === 'active'
                      ? 'fill-sky-400/90'
                      : 'fill-muted-foreground/60'
                }`}
              >
                ${milestone.amount.toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={buildArea(history, maxY, width)} fill="url(#walletGradient)" />
        <path
          d={buildSmoothPath(history, maxY, width)}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {history.map((point, i) => {
          if (i % 4 !== 0 && i !== history.length - 1) return null;
          const x = PADDING.left + (i / Math.max(history.length - 1, 1)) * innerW;
          return (
            <text
              key={`${point.label}-${i}`}
              x={x}
              y={CHART_HEIGHT - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {point.label}
            </text>
          );
        })}

        {markers.map((marker) => (
          <MilestoneDot key={marker.milestone.id} marker={marker} />
        ))}

        {lastPoint && (
          <g filter="url(#dotGlow)">
            <circle cx={lastX} cy={lastY} r={5} fill="#38bdf8" stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap gap-3">
        {milestones
          .filter((m) => m.status !== 'upcoming')
          .map((milestone) => {
            const Icon = MILESTONE_ICONS[milestone.icon];
            return (
              <div
                key={milestone.id}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] ${
                  milestone.status === 'completed'
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                    : 'border-sky-500/30 bg-sky-500/5 text-sky-300'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span>
                  ${milestone.amount.toLocaleString()} · {milestone.title}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

interface PriceChartProps {
  history: ChartPoint[];
  change24h: number;
}

export function PriceChart({ history, change24h }: PriceChartProps) {
  const width = 680;
  const maxY = Math.max(...history.map((p) => p.value)) * 1.04;
  const minY = Math.min(...history.map((p) => p.value)) * 0.96;
  const range = maxY - minY || 1;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const innerW = width - PADDING.left - PADDING.right;
  const positive = change24h >= 0;
  const stroke = positive ? '#34d399' : '#f87171';
  const fillId = positive ? 'priceUp' : 'priceDown';

  const coords = history.map((p, i) => ({
    x: PADDING.left + (i / Math.max(history.length - 1, 1)) * innerW,
    y: PADDING.top + innerH - ((p.value - minY) / range) * innerH,
    value: p.value,
    label: p.label,
  }));

  let smoothPath = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    smoothPath += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }

  const areaPath = `${smoothPath} L${coords[coords.length - 1].x},${CHART_HEIGHT - PADDING.bottom} L${coords[0].x},${CHART_HEIGHT - PADDING.bottom} Z`;

  const yTicks = [minY, minY + range * 0.33, minY + range * 0.66, maxY];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="min-w-[340px] w-full"
        role="img"
        aria-label="24 hour price chart"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = PADDING.top + innerH - ((tick - minY) / range) * innerH;
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
                ${tick < 0.01 ? tick.toFixed(5) : tick.toFixed(4)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#${fillId})`} />
        <path d={smoothPath} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />

        {coords.map((c, i) => {
          if (i % 6 !== 0 && i !== coords.length - 1) return null;
          return (
            <circle key={i} cx={c.x} cy={c.y} r={2} fill={stroke} opacity={0.6} />
          );
        })}

        {coords.map((c, i) => {
          if (!c.label) return null;
          return (
            <text
              key={`lbl-${i}`}
              x={c.x}
              y={CHART_HEIGHT - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {c.label}
            </text>
          );
        })}

        <circle
          cx={coords[coords.length - 1].x}
          cy={coords[coords.length - 1].y}
          r={5}
          fill={stroke}
          stroke="#fff"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
