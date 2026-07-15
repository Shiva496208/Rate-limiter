"use client";

export default function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[0.8rem] text-muted">{label}</span>
        <span className="mono tabular text-[0.8rem] text-text">
          {value}
          {unit ? <span className="text-faint"> {unit}</span> : null}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
