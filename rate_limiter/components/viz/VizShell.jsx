"use client";

// Shared frame for every algorithm visualization: a primary meter at the
// top (either "capacity" style — more is healthy — or "load" style —
// approaching the limit turns red), the bespoke SVG scene, and a caption
// that narrates what the viewer is looking at.

function loadColor(ratio) {
  if (ratio >= 0.999) return "var(--deny)";
  if (ratio >= 0.8) return "var(--warn)";
  return "var(--allow)";
}

export default function VizShell({ primary, accent, caption, children }) {
  const ratio = primary ? Math.min(1, primary.value / primary.max) : 0;
  const isLoad = primary?.mode === "load";
  const barColor = isLoad ? loadColor(primary.value / primary.max) : accent;

  return (
    <div className="flex flex-col gap-4">
      {primary ? (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[0.8rem] text-muted">{primary.label}</span>
            <span className="mono tabular text-sm">
              <span className="font-semibold" style={{ color: barColor }}>
                {primary.value.toFixed(primary.value % 1 === 0 ? 0 : 1)}
              </span>
              <span className="text-faint"> / {primary.max}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel-3">
            <div
              className="h-full rounded-full transition-[width,background-color] duration-150"
              style={{ width: `${ratio * 100}%`, background: barColor }}
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border-soft bg-[#0b0d12] p-3">{children}</div>

      {caption ? (
        <p className="text-[0.78rem] leading-relaxed text-faint">{caption}</p>
      ) : null}
    </div>
  );
}
