import SiteHeader from "@/components/SiteHeader";
import AlgorithmCard from "@/components/AlgorithmCard";
import { algorithms } from "@/lib/algorithms";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        {/* Hero */}
        <section className="fade-up py-14 sm:py-20">
          <div className="chip mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Interactive · animated · zero setup
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            See how <span className="text-accent">rate limiters</span> actually work.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            Five classic algorithms, each with a live simulation you can poke at — send
            requests, unleash bursts, and watch tokens, queues and windows respond in real
            time. The visual layer for a rate-limiter service whose Node backend is on the way.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`/algorithms/${algorithms[0].meta.slug}`} className="btn btn-accent">
              Start with Token Bucket →
            </a>
            <a href="#algorithms" className="btn">
              Browse all five
            </a>
          </div>
        </section>

        {/* Algorithm grid */}
        <section id="algorithms" className="scroll-mt-20">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Algorithms</h2>
            <span className="mono text-[0.78rem] text-faint">{algorithms.length} strategies</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {algorithms.map((a, i) => (
              <AlgorithmCard key={a.meta.slug} meta={a.meta} index={i} />
            ))}
          </div>
        </section>

        {/* How to read */}
        <section className="mt-14">
          <div className="panel p-6">
            <h2 className="mb-4 text-base font-semibold tracking-tight">How to read the visualizers</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Legend swatch="var(--allow)" title="Allowed">
                The limiter had capacity — the request passed and was counted.
              </Legend>
              <Legend swatch="var(--deny)" title="Rejected">
                The limit was hit — the request was dropped (or would overflow).
              </Legend>
              <Legend swatch="var(--accent)" title="State">
                Tokens, queue depth or window counts — the limiter's live internal state.
              </Legend>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-[0.8rem] text-faint">
          <span>RateLab — rate-limiter visualizer</span>
          <span className="mono">UI first · Node backend next</span>
        </div>
      </footer>
    </>
  );
}

function Legend({ swatch, title, children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: swatch }} />
      <div>
        <div className="text-[0.88rem] font-medium">{title}</div>
        <p className="mt-0.5 text-[0.8rem] leading-relaxed text-faint">{children}</p>
      </div>
    </div>
  );
}
