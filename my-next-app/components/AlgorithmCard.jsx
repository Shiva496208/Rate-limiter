import Link from "next/link";

export default function AlgorithmCard({ meta, index }) {
  return (
    <Link
      href={`/algorithms/${meta.slug}`}
      className="group panel fade-up relative flex flex-col gap-3 p-5 transition-colors hover:border-[color-mix(in_oklab,var(--card-accent)_55%,var(--border))]"
      style={{ "--card-accent": meta.accent, animationDelay: `${index * 60}ms` }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${meta.accent}, transparent)`,
        }}
      />
      <div className="flex items-center justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl border text-xl"
          style={{
            borderColor: `color-mix(in oklab, ${meta.accent} 40%, var(--border))`,
            background: `color-mix(in oklab, ${meta.accent} 12%, var(--panel-2))`,
          }}
        >
          {meta.emoji}
        </span>
        <span
          className="mono text-[0.68rem]"
          style={{ color: meta.accent }}
        >
          0{index + 1}
        </span>
      </div>

      <div>
        <h3 className="font-semibold tracking-tight">{meta.name}</h3>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">{meta.tagline}</p>
      </div>

      <div className="mt-auto flex items-center gap-1.5 text-[0.8rem] font-medium text-faint transition-colors group-hover:text-text">
        Open visualizer
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
