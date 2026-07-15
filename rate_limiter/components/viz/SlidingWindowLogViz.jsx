"use client";

import VizShell from "./VizShell";

const W = 480;
const H = 200;
const PAD = 12;

function jitter(id) {
  return ((id * 2654435761) % 1000) / 1000;
}

export default function SlidingWindowLogViz({ snap, events = [], accent }) {
  if (!snap) return <div className="h-56 animate-pulse rounded-xl bg-panel-2" />;
  const { now, windowSec, limit, count } = snap;

  const span = windowSec * 1.7;
  const tMin = now - span;
  const xOf = (t) => PAD + ((t - tMin) / span) * (W - PAD * 2);

  const winStart = now - windowSec;
  const laneTop = 46;
  const laneBottom = 150;
  const dots = events.filter((e) => e.t >= tMin);

  return (
    <VizShell
      primary={snap.primary}
      accent={accent}
      caption="The highlighted box is the window — always exactly the last N seconds, sliding right with 'now'. Only requests inside it (green) count toward the limit. As time passes, old requests slip out the left edge and fade, freeing capacity."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* expired region hint */}
        <rect x={PAD} y={laneTop - 8} width={xOf(winStart) - PAD} height={laneBottom - laneTop + 20} fill="var(--panel-2)" opacity="0.4" />

        {/* sliding window */}
        <rect
          x={xOf(winStart)}
          y={laneTop - 10}
          width={xOf(now) - xOf(winStart)}
          height={laneBottom - laneTop + 24}
          rx="6"
          fill={`color-mix(in oklab, ${accent} 15%, transparent)`}
          stroke={`color-mix(in oklab, ${accent} 55%, transparent)`}
          strokeWidth="1.5"
        />
        <text x={(xOf(winStart) + xOf(now)) / 2} y={laneTop - 16} textAnchor="middle" className="mono" fill={accent} fontSize="10">
          window · {count}/{limit}
        </text>
        <text x={xOf(winStart) + 3} y={laneBottom + 30} className="mono" fill="var(--faint)" fontSize="9">
          −{windowSec}s
        </text>

        {/* request dots */}
        {dots.map((e) => {
          const x = xOf(e.t);
          const y = laneTop + jitter(e.id) * (laneBottom - laneTop);
          const inWindow = e.t >= winStart;
          let fill = "var(--faint)";
          let op = 0.35;
          if (e.allowed && inWindow) {
            fill = "var(--allow)";
            op = 1;
          } else if (!e.allowed) {
            fill = "var(--deny)";
            op = inWindow ? 0.9 : 0.4;
          }
          return <circle key={e.id} cx={x} cy={y} r="4" fill={fill} opacity={op} style={{ transition: "opacity 0.2s ease" }} />;
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
