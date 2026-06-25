import { useId, useMemo } from 'react';
import {
  MARKETING_SPEND_FLOW,
  formatSpendCost,
  type MarketingSpendNode,
} from '../data/marketingSpendFlow';

const WIDTH = 720;
const HEIGHT = 240;
const PADDING = { top: 36, right: 20, bottom: 52, left: 44 };

function nodeToCoord(node: MarketingSpendNode) {
  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;
  return {
    x: PADDING.left + node.x * innerW,
    y: PADDING.top + innerH - node.y * innerH,
  };
}

function buildFlowPath(nodes: MarketingSpendNode[]): string {
  const start = {
    x: PADDING.left,
    y: PADDING.top + (HEIGHT - PADDING.top - PADDING.bottom) * 0.92,
  };

  const anchors = [start, ...nodes.map(nodeToCoord)];
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const from = anchors[i];
    const to = anchors[i + 1];
    const steps = i === 0 ? 6 : 8;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const ease = t * t * (3 - 2 * t);
      const wave =
        Math.sin(t * Math.PI * 2.4 + i * 1.1) * (HEIGHT - PADDING.top - PADDING.bottom) * 0.018;

      points.push({
        x: from.x + (to.x - from.x) * ease,
        y: from.y + (to.y - from.y) * ease + wave * (1 - Math.abs(t - 0.5) * 2),
      });
    }
  }

  if (points.length < 2) return '';

  let path = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }

  return path;
}

function buildArea(linePath: string): string {
  const baseY = HEIGHT - PADDING.bottom;
  const endX = WIDTH - PADDING.right;
  return `${linePath} L${endX},${baseY} L${PADDING.left},${baseY} Z`;
}

function SpendNode({ node, index }: { node: MarketingSpendNode; index: number }) {
  const { x, y } = nodeToCoord(node);
  const isLast = index === MARKETING_SPEND_FLOW.length - 1;

  return (
    <g>
      {isLast && (
        <circle cx={x} cy={y} r={20} fill="rgba(56,189,248,0.15)" className="animate-pulse" />
      )}
      <circle cx={x} cy={y} r={18} fill="rgba(52,211,153,0.12)" />
      <circle
        cx={x}
        cy={y}
        r={11}
        fill={isLast ? '#0c4a6e' : '#052e1f'}
        stroke={isLast ? '#38bdf8' : '#34d399'}
        strokeWidth={2}
      />
      <circle cx={x} cy={y} r={4} fill={isLast ? '#38bdf8' : '#34d399'} />

      <text
        x={x}
        y={y - 18}
        textAnchor="middle"
        className="fill-emerald-300 text-[10px] font-semibold"
      >
        {formatSpendCost(node.cost)}
      </text>

      <text
        x={x}
        y={HEIGHT - PADDING.bottom + 16}
        textAnchor="middle"
        className={`text-[9px] font-medium ${isLast ? 'fill-sky-300' : 'fill-white/85'}`}
      >
        {node.label}
      </text>
      <text
        x={x}
        y={HEIGHT - PADDING.bottom + 28}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px]"
      >
        {index === 0 ? '1st unlock' : index === MARKETING_SPEND_FLOW.length - 1 ? 'Scale-up' : `Step ${index + 1}`}
      </text>
    </g>
  );
}

export function MarketingSpendFlowChart() {
  const uid = useId().replace(/:/g, '');
  const lineGradientId = `marketing-line-${uid}`;
  const areaGradientId = `marketing-area-${uid}`;

  const linePath = useMemo(() => buildFlowPath(MARKETING_SPEND_FLOW), []);
  const areaPath = useMemo(() => buildArea(linePath), [linePath]);

  const innerH = HEIGHT - PADDING.top - PADDING.bottom;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="dex-card overflow-hidden">
      <div className="relative z-[1]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
              Marketing wallet
            </p>
            <p className="mt-0.5 text-sm font-medium text-white">
              Automated spend as milestones unlock
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Example vendor sequence · costs per placement
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="min-w-[320px] w-full"
            role="img"
            aria-label="Marketing wallet chart showing automated spend at Telegram, DexScreener, trending bar, and Coinzilla"
          >
            <defs>
              <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = PADDING.top + innerH - tick * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={WIDTH - PADDING.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {tick === 0 ? '$0' : tick === 1 ? '$3.5K' : `$${Math.round(tick * 3.5)}K`}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} fill={`url(#${areaGradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${lineGradientId})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />

            {MARKETING_SPEND_FLOW.map((node, index) => (
              <SpendNode key={node.id} node={node} index={index} />
            ))}

            {['Day 1', 'Week 1', 'Week 2', 'Week 4'].map((label, i) => {
              const innerW = WIDTH - PADDING.left - PADDING.right;
              const x = PADDING.left + (i / 3) * innerW;
              return (
                <text
                  key={label}
                  x={x}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground/70 text-[8px]"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {MARKETING_SPEND_FLOW.map((node) => (
            <span
              key={node.id}
              className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-200/90"
            >
              {node.label} · {formatSpendCost(node.cost)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
