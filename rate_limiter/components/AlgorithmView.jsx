"use client";

import Link from "next/link";
import { algorithms, getAlgorithm } from "@/lib/algorithms";
import Playground from "@/components/Playground";

export default function AlgorithmView({ slug }) {
  const algo = getAlgorithm(slug);
  if (!algo) return null;
  const meta = algo.meta;

  const idx = algorithms.findIndex((a) => a.meta.slug === slug);
  const prev = idx > 0 ? algorithms[idx - 1].meta : null;
  const next = idx < algorithms.length - 1 ? algorithms[idx + 1].meta : null;

  return (
    <div className="fade-up mx-auto max-w-6xl px-5 py-8" style={{ "--accent": meta.accent }}>
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-[0.8rem] text-faint">
        <Link href="/" className="hover:text-text">
          Algorithms
        </Link>
        <span>/</span>
        <span className="text-muted">{meta.name}</span>
      </nav>

      {/* Title */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl border text-2xl"
            style={{
              borderColor: `color-mix(in oklab, ${meta.accent} 40%, var(--border))`,
              background: `color-mix(in oklab, ${meta.accent} 12%, var(--panel-2))`,
            }}
          >
            {meta.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{meta.name}</h1>
            <p className="mt-0.5 max-w-xl text-[0.9rem] text-muted">{meta.tagline}</p>
          </div>
        </div>
        <span className="chip" style={{ borderColor: `color-mix(in oklab, ${meta.accent} 40%, var(--border))` }}>
          best for: {meta.bestFor}
        </span>
      </div>

      {/* Interactive playground */}
      <Playground algo={algo} />

      {/* Explanation */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="panel p-5 md:col-span-2">
          <p className="text-[0.95rem] leading-relaxed text-muted">{meta.summary}</p>
        </div>

        <div className="panel p-5">
          <h3 className="mb-3 text-sm font-semibold">How it works</h3>
          <ol className="flex flex-col gap-2.5">
            {meta.howItWorks.map((step, i) => (
              <li key={i} className="flex gap-3 text-[0.86rem] leading-relaxed text-muted">
                <span
                  className="mono mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[0.7rem]"
                  style={{
                    color: meta.accent,
                    background: `color-mix(in oklab, ${meta.accent} 15%, var(--panel-2))`,
                  }}
                >
                  {i + 1}
                </span>
                <Markup text={step} />
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="text-allow">＋</span> Strengths
            </h3>
            <ul className="flex flex-col gap-2">
              {meta.pros.map((x, i) => (
                <li key={i} className="flex gap-2 text-[0.84rem] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-allow" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="text-deny">－</span> Trade-offs
            </h3>
            <ul className="flex flex-col gap-2">
              {meta.cons.map((x, i) => (
                <li key={i} className="flex gap-2 text-[0.84rem] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-deny" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prev / next */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {prev ? (
          <Link href={`/algorithms/${prev.slug}`} className="btn">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/algorithms/${next.slug}`} className="btn">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

// Renders `backtick` spans in monospace.
function Markup({ text }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="mono rounded bg-panel-3 px-1 py-0.5 text-[0.8em] text-text">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}
