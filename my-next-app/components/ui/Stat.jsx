"use client";

export default function Stat({ label, value, tone = "default", sub }) {
  const toneColor =
    tone === "allow" ? "text-allow" : tone === "deny" ? "text-deny" : "text-text";
  return (
    <div className="panel-2 px-3 py-2.5">
      <div className="text-[0.68rem] uppercase tracking-wider text-faint">{label}</div>
      <div className={`mono tabular text-xl font-semibold ${toneColor}`}>{value}</div>
      {sub ? <div className="text-[0.68rem] text-faint mt-0.5">{sub}</div> : null}
    </div>
  );
}
