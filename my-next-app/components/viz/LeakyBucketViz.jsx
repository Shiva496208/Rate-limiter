"use client";

import VizShell from "./VizShell";

export default function LeakyBucketViz({ snap, accent }) {
  if (!snap) return <div className="h-56 animate-pulse rounded-xl bg-panel-2" />;
  const { level, capacity, leakRate } = snap;

  const bx = 130;
  const bw = 80;
  const top = 55;
  const bottom = 210;
  const innerH = bottom - top;
  const segH = innerH / capacity;
  const filledSegs = Math.floor(level + 1e-9);
  const partial = level - filledSegs;
  const nearFull = level >= capacity - 0.001;

  const leakDur = Math.min(2, Math.max(0.3, 1 / Math.max(0.5, leakRate)));

  const segs = [];
  for (let i = 0; i < capacity; i++) {
    const y = bottom - (i + 1) * segH;
    let op = 0;
    if (i < filledSegs) op = 1;
    else if (i === filledSegs && partial > 0.05) op = partial;
    if (op > 0) segs.push({ y, h: segH - 1.5, op });
  }

  return (
    <VizShell
      primary={snap.primary}
      accent={accent}
      caption="Requests stack up in the bucket and drain out the bottom at a fixed leak rate — a perfectly smooth output. If the queue reaches capacity, new arrivals overflow the rim and are dropped."
    >
      <svg viewBox="0 0 340 260" className="h-auto w-full">
        {/* inflow */}
        <text x="170" y="22" textAnchor="middle" className="mono" fill="var(--muted)" fontSize="11">
          incoming requests
        </text>
        <circle cx="170" cy="34" r="3.6" fill={accent}
          style={{ "--drip-distance": "16px", animation: "drip 0.9s linear infinite" }} />

        {/* overflow indicator */}
        {nearFull ? (
          <g>
            <text x="250" y="60" className="mono" fill="var(--deny)" fontSize="10">overflow →</text>
            <circle cx="222" cy="58" r="3.2" fill="var(--deny)"
              style={{ "--drip-distance": "22px", animation: "drip 0.5s linear infinite" }} />
          </g>
        ) : null}

        {/* bucket */}
        <path
          d={`M${bx - 8} ${top - 4} L${bx} ${bottom} Q${bx} ${bottom + 8} ${bx + 8} ${bottom + 8} L${bx + bw - 8} ${bottom + 8} Q${bx + bw} ${bottom + 8} ${bx + bw} ${bottom} L${bx + bw + 8} ${top - 4}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* queued requests */}
        {segs.map((s, i) => (
          <rect
            key={i}
            x={bx + 3}
            y={s.y}
            width={bw - 6}
            height={s.h}
            rx="2"
            fill={accent}
            opacity={s.op}
            style={{ transition: "opacity 0.12s ease, y 0.12s ease" }}
          />
        ))}

        {/* leak spout + falling drops */}
        <text x="170" y="252" textAnchor="middle" className="mono" fill="var(--muted)" fontSize="11">
          leak {leakRate}/s
        </text>
        {[0, 1].map((i) => (
          <circle
            key={i}
            cx="170"
            cy={bottom + 12}
            r="3.4"
            fill={accent}
            style={{ "--drip-distance": "24px", animation: `drip ${leakDur}s linear ${i * (leakDur / 2)}s infinite` }}
          />
        ))}
      </svg>
    </VizShell>
  );
}
