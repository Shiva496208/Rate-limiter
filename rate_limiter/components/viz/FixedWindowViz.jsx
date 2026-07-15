"use client";

import VizShell from "./VizShell";

const W = 480;
const H = 200;
const PAD = 12;

function jitter(id) {
  return ((id * 2654435761) % 1000) / 1000;
}

export default function FixedWindowViz({ snap, events = [], accent }) {
  if (!snap) return <div className="h-56 animate-pulse rounded-xl bg-panel-2" />;
  const { now, windowSec, limit, count, resetIn } = snap;

  const span = windowSec * 2.5;
  const tMin = now - span;
  const xOf = (t) => PAD + ((t - tMin) / span) * (W - PAD * 2);

  // Visible window boundaries
  const firstIdx = Math.floor(tMin / windowSec);
  const lastIdx = Math.floor(now / windowSec);
  const bands = [];
  for (let k = firstIdx; k <= lastIdx; k++) {
    const start = k * windowSec;
    const end = start + windowSec;
    const x0 = xOf(Math.max(start, tMin));
    const x1 = xOf(Math.min(end, now));
    bands.push({ k, x0, x1, current: k === lastIdx });
  }

  const laneTop = 42;
  const laneBottom = 150;
  const dots = events.filter((e) => e.t >= tMin);

  return (
    <VizShell
      primary={snap.primary}
      accent={accent}
      caption="Each shaded band is a fixed window; at every boundary the counter snaps back to zero (dashed line). Watch the seam: a burst at the end of one window plus a burst at the start of the next can briefly admit up to 2× the limit."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {bands.map((b) => (
          <g key={b.k}>
            <rect
              x={b.x0}
              y={laneTop - 8}
              width={Math.max(0, b.x1 - b.x0)}
              height={laneBottom - laneTop + 20}
              fill={b.current ? `color-mix(in oklab, ${accent} 14%, transparent)` : "var(--panel-2)"}
              opacity={b.current ? 1 : 0.5}
            />
            <line
              x1={b.x0}
              y1={laneTop - 10}
              x2={b.x0}
              y2={laneBottom + 14}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </g>
        ))}

        {/* reset labels at boundaries */}
        {bands.slice(1).map((b) => (
          <text key={b.k} x={b.x0 + 3} y={laneTop - 14} className="mono" fill="var(--faint)" fontSize="9">
            reset
          </text>
        ))}

        {/* current window counter */}
        {(() => {
          const cur = bands[bands.length - 1];
          if (!cur) return null;
          const cx = (cur.x0 + cur.x1) / 2;
          return (
            <text x={cx} y={laneTop - 14} textAnchor="middle" className="mono" fill={accent} fontSize="10">
              {count}/{limit} · resets {resetIn.toFixed(1)}s
            </text>
          );
        })()}

        {/* request dots */}
        {dots.map((e) => {
          const x = xOf(e.t);
          const y = laneTop + jitter(e.id) * (laneBottom - laneTop);
          return (
            <circle
              key={e.id}
              cx={x}
              cy={y}
              r="4"
              fill={e.allowed ? "var(--allow)" : "var(--deny)"}
              opacity={e.allowed ? 0.95 : 0.9}
            />
          );
        })}

        {/* now cursor */}
        <line x1={xOf(now)} y1={laneTop - 12} x2={xOf(now)} y2={laneBottom + 16} stroke={accent} strokeWidth="1.5" />
        <text x={xOf(now) - 4} y={laneBottom + 30} textAnchor="end" className="mono" fill="var(--muted)" fontSize="9">
          now
        </text>
      </svg>
    </VizShell>
  );
}
