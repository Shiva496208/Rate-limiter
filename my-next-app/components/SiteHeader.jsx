import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-panel-2 text-sm">
            ⏱️
          </span>
          <span className="font-semibold tracking-tight">
            Rate<span className="text-accent">Lab</span>
          </span>
          <span className="mono hidden text-[0.7rem] text-faint sm:inline">
            rate-limiter visualizer
          </span>
        </Link>
        <a
          href="https://github.com"
          className="chip hover:border-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          Node backend — coming soon
        </a>
      </div>
    </header>
  );
}
