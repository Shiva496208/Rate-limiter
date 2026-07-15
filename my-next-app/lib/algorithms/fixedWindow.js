// Fixed Window Counter
// ------------------------------------------------------------------
// Time is chopped into fixed windows of `windowSec`. A single counter
// tracks requests in the current window and resets to zero at every
// boundary. Simple and cheap, but it has the classic "boundary burst"
// flaw: up to `limit` requests can land at the end of one window and
// another `limit` right after the reset — 2x the limit across the seam.

export const meta = {
  slug: "fixed-window",
  name: "Fixed Window Counter",
  emoji: "🪟",
  accent: "#f59e0b",
  tagline: "One counter per window. Simple, with a burst edge case.",
  summary:
    "Count requests inside fixed clock windows and reset at each boundary. It is trivially cheap, but two back-to-back windows can admit up to twice the limit right at the seam.",
  howItWorks: [
    "Divide time into fixed windows of `windowSec` seconds.",
    "Keep one counter for the current window.",
    "Allow a request if the counter is below `limit`, then increment it.",
    "At each window boundary the counter resets to zero.",
  ],
  pros: [
    "Extremely simple and memory-cheap — a single integer per client.",
    "Easy to reason about and explain.",
  ],
  cons: [
    "Boundary burst: up to 2x the limit can pass across a window edge.",
    "Traffic can be very uneven within a window.",
  ],
  bestFor: "Coarse limits where an occasional edge-of-window burst is fine.",
  params: [
    { key: "windowSec", label: "Window size", min: 2, max: 10, step: 1, default: 5, unit: "s" },
    { key: "limit", label: "Requests / window", min: 1, max: 20, step: 1, default: 8, unit: "reqs" },
  ],
};

export function create(initial) {
  let p = { ...initial };
  let windowIndex = null;
  let count = 0;

  function roll(now) {
    const idx = Math.floor(now / p.windowSec);
    if (windowIndex == null) {
      windowIndex = idx;
      count = 0;
    } else if (idx !== windowIndex) {
      windowIndex = idx;
      count = 0;
    }
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
      count = 0;
    },
    tick(now) {
      roll(now);
    },
    send(now) {
      roll(now);
      let allowed = false;
      if (count < p.limit) {
        count += 1;
        allowed = true;
      }
      return { t: now, allowed, kind: allowed ? "count" : "reject" };
    },
    snapshot(now) {
      const idx = Math.floor(now / p.windowSec);
      const windowStart = idx * p.windowSec;
      const frac = (now - windowStart) / p.windowSec;
      return {
        now,
        count,
        limit: p.limit,
        windowSec: p.windowSec,
        windowStart,
        windowIndex: idx,
        frac,
        resetIn: windowStart + p.windowSec - now,
        primary: { value: count, max: p.limit, mode: "load", label: "requests this window" },
      };
    },
  };
}
