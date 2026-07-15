"use client";

import VizShell from "./VizShell";

const W = 480;
const H = 220;

export default function SlidingWindowCounterViz({ snap, accent }) {
  if (!snap) return <div className="h-56 animate-pulse rounded-xl bg-panel-2" />;
  const { windowSec, limit, current, previous, frac, weightedPrev, estimate, windowStart } = snap;

  // Two window boxes: previous [40..220], current [220..400]
  const pxPrev = 40;
  const boxW = 180;
  const pxCurEnd = pxPrev + boxW * 2; // 400
  const top = 60;
  const bottom = 150;

  const now = windowStart + frac * windowSec;
  const xOf = (t) => 220 + ((t - windowStart) / windowSec) * boxW;
  const rollStart = now - windowSec;

  const xRoll0 = xOf(rollStart);
  const xNow = xOf(now);

  return (
    <VizShell
      primary={snap.primary}
      accent={accent}
      caption="Only two counters are kept — this window and the last. The rolling window (highlighted) covers a shrinking slice of the previous window plus the current one. The estimate weights the previous count by that overlap: prev × (1 − elapsed) + current."
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* window boxes */}
        <rect x={pxPrev} y={top} width={boxW} height={bottom - top} fill="var(--panel-2)" stroke="var(--border)" />
        <rect x={pxPrev + boxW} y={top} width={boxW} height={bottom - top} fill="var(--panel-2)" stroke="var(--border)" />

        <text x={pxPrev + boxW / 2} y={top - 10} textAnchor="middle" className="mono" fill="var(--faint)" fontSize="10">
          previous window
        </text>
        <text x={pxPrev + boxW + boxW / 2} y={top - 10} textAnchor="middle" className="mono" fill="var(--faint)" fontSize="10">
          current window
        </text>

        {/* counts */}
        <text x={pxPrev + boxW / 2} y={(top + bottom) / 2 + 6} textAnchor="middle" className="mono" fill="var(--muted)" fontSize="22" fontWeight="600">
          {previous}
        </text>
        <text x={pxPrev + boxW + boxW / 2} y={(top + bottom) / 2 + 6} textAnchor="middle" className="mono" fill={accent} fontSize="22" fontWeight="600">
          {current}
        </text>

        {/* rolling window overlay */}
        <rect
          x={xRoll0}
          y={top - 6}
          width={xNow - xRoll0}
          height={bottom - top + 12}
          rx="5"
          fill={`color-mix(in oklab, ${accent} 16%, transparent)`}
          stroke={`color-mix(in oklab, ${accent} 55%, transparent)`}
          strokeWidth="1.5"
        />
        <text x={(xRoll0 + xNow) / 2} y={bottom + 22} textAnchor="middle" className="mono" fill={accent} fontSize="10">
          rolling window (last {windowSec}s)
        </text>

        {/* now cursor */}
        <line x1={xNow} y1={top - 10} x2={xNow} y2={bottom + 8} stroke={accent} strokeWidth="1.5" />
        <text x={xNow} y={top - 24} textAnchor="middle" className="mono" fill="var(--muted)" fontSize="9">
          now
        </text>

        {/* formula readout */}
        <text x={W / 2} y={H - 12} textAnchor="middle" className="mono" fill="var(--muted)" fontSize="11">
          {previous} × {(1 - frac).toFixed(2)} + {current} ={" "}
          <tspan fill={estimate >= limit ? "var(--deny)" : "var(--allow)"} fontWeight="600">
            {estimate.toFixed(2)}
          </tspan>{" "}
          / {limit}
        </text>
      </svg>
    </VizShell>
  );
}
