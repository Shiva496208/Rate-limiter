"use client";

import VizShell from "./VizShell";

const COLS = 4;

export default function TokenBucketViz({ snap, accent }) {
  if (!snap) return <Placeholder />;
  const { tokens, capacity, refillRate } = snap;
  const filled = Math.floor(tokens + 1e-9);
  const partial = tokens - filled;

  const rows = Math.ceil(capacity / COLS);
  const innerX = 120;
  const innerBottom = 200;
  const innerW = 100;
  const innerH = 150;
  const cellW = innerW / COLS;
  const cellH = innerH / rows;
  const r = Math.min(cellW, cellH) * 0.3;

  const slots = [];
  for (let i = 0; i < capacity; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const cx = innerX + (col + 0.5) * cellW;
    const cy = innerBottom - (row + 0.5) * cellH;
    let state = "empty";
    let opacity = 1;
    if (i < filled) state = "full";
    else if (i === filled && partial > 0.05) {
      state = "partial";
      opacity = partial;
    }
    slots.push({ cx, cy, state, opacity });
  }

  const dripDur = Math.min(2, Math.max(0.35, 1 / Math.max(0.5, refillRate)));

  return (
    <VizShell
      primary={snap.primary}
      accent={accent}
      caption="Tokens (colored dots) refill steadily from the top and fill the bucket up to its capacity. Each request spends one token; when the bucket is empty, requests are rejected until it refills."
    >
      <svg viewBox="0 0 340 240" className="h-auto w-full">
        {/* refill label + animated drips */}
        <text x="170" y="24" textAnchor="middle" className="mono" fill="var(--muted)" fontSize="11">
          refill +{refillRate}/s
        </text>
        {[0, 1].map((i) => (
          <circle
            key={i}
            cx={158 + i * 24}
            cy={34}
            r={3.4}
            fill={accent}
            style={{
              // eslint-disable-next-line
              "--drip-distance": "18px",
              animation: `drip ${dripDur}s linear ${i * (dripDur / 2)}s infinite`,
            }}
          />
        ))}

        {/* bucket walls (open-top U) */}
        <path
          d="M112 46 L120 206 Q120 214 128 214 L212 214 Q220 214 220 206 L228 46"
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M120 206 Q120 214 128 214 L212 214 Q220 214 220 206 L215 200 L125 200 Z"
          fill="color-mix(in oklab, var(--panel-3) 60%, transparent)"
        />

        {/* token slots */}
        {slots.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={r}
            fill={s.state === "empty" ? "transparent" : accent}
            stroke={s.state === "empty" ? "var(--border)" : "transparent"}
            strokeWidth="1.5"
            opacity={s.opacity}
            style={{
              filter: s.state === "full" ? `drop-shadow(0 0 4px ${accent}88)` : "none",
              transition: "opacity 0.15s ease",
            }}
          />
        ))}
      </svg>
    </VizShell>
  );
}

function Placeholder() {
  return <div className="h-56 animate-pulse rounded-xl bg-panel-2" />;
}
