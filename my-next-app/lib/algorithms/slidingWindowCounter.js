// Sliding Window Counter
// ------------------------------------------------------------------
// A pragmatic middle ground between fixed window and sliding log. Keep
// only two counters: the current fixed window and the previous one. The
// estimate weights the previous window's count by how much of it still
// overlaps the rolling window:
//
//     estimate = prev * (1 − elapsedFraction) + current
//
// Near-exact enforcement with O(1) memory — the approach popularised by
// Cloudflare.

export const meta = {
  slug: "sliding-window-counter",
  name: "Sliding Window Counter",
  emoji: "🌗",
  accent: "#a855f7",
  tagline: "Sliding-window accuracy at fixed-window cost.",
  summary:
    "Blend the current and previous fixed-window counts, weighting the previous window by how much of it still overlaps the rolling window. Smooths the boundary burst using just two counters.",
  howItWorks: [
    "Keep counts for the current window and the previous window.",
    "Compute how far we are into the current window (`elapsedFraction`).",
    "Estimate load = previous × (1 − elapsedFraction) + current.",
    "Allow the request if that weighted estimate is below `limit`.",
  ],
  pros: [
    "O(1) memory — just two integers per client.",
    "Largely removes the fixed-window boundary burst.",
    "Cheap enough for high-scale, distributed deployments.",
  ],
  cons: [
    "An approximation: assumes previous-window traffic was evenly spread.",
    "Can be slightly lenient or strict versus an exact log.",
  ],
  bestFor: "High-scale API gateways wanting accuracy without the memory.",
  params: [
    { key: "windowSec", label: "Window size", min: 2, max: 10, step: 1, default: 5, unit: "s" },
    { key: "limit", label: "Requests / window", min: 1, max: 20, step: 1, default: 8, unit: "reqs" },
  ],
};

export function create(initial) {
  let p = { ...initial };
  let windowIndex = null;
  let current = 0;
  let previous = 0;

  function roll(now) {
    const idx = Math.floor(now / p.windowSec);
    if (windowIndex == null) {
      windowIndex = idx;
      current = 0;
      previous = 0;
      return;
    }
    if (idx === windowIndex) return;
    if (idx === windowIndex + 1) {
      previous = current;
    } else {
      previous = 0; // skipped one or more empty windows
    }
    current = 0;
    windowIndex = idx;
  }

  function estimate(now) {
    if (windowIndex == null) return 0;
    const windowStart = windowIndex * p.windowSec;
    const frac = Math.min(1, Math.max(0, (now - windowStart) / p.windowSec));
    return previous * (1 - frac) + current;
  }

  return {
    get params() {
      return p;
    },
    setParams(np) {
      p = { ...p, ...np };
    },
    reset(now) {
      windowIndex = now != null ? Math.floor(now / p.windowSec) : null;
      current = 0;
      previous = 0;
    },
    tick(now) {
      roll(now);
    },
    send(now) {
      roll(now);
      const est = estimate(now);
      let allowed = false;
      if (est < p.limit) {
        current += 1;
        allowed = true;
      }
      return { t: now, allowed, kind: allowed ? "count" : "reject" };
    },
    snapshot(now) {
      const idx = windowIndex ?? Math.floor(now / p.windowSec);
      const windowStart = idx * p.windowSec;
      const frac = Math.min(1, Math.max(0, (now - windowStart) / p.windowSec));
      const weightedPrev = previous * (1 - frac);
      return {
        now,
        current,
        previous,
        frac,
        weightedPrev,
        estimate: weightedPrev + current,
        limit: p.limit,
        windowSec: p.windowSec,
        windowStart,
        primary: { value: weightedPrev + current, max: p.limit, mode: "load", label: "weighted estimate" },
      };
    },
  };
}
