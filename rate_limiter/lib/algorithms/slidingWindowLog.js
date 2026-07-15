// Sliding Window Log
// ------------------------------------------------------------------
// Store the timestamp of every allowed request. To decide a new
// request, drop all timestamps older than `windowSec` and count what
// remains; allow if the count is below `limit`. This is the most
// accurate algorithm — the window truly slides — at the cost of storing
// one timestamp per request in the window.

export const meta = {
  slug: "sliding-window-log",
  name: "Sliding Window Log",
  emoji: "🎞️",
  accent: "#10b981",
  tagline: "Exact enforcement over a truly rolling window.",
  summary:
    "Keep a log of every request's timestamp. Expire entries older than the window, then count what's left. Perfectly accurate with no boundary bursts — but memory grows with traffic.",
  howItWorks: [
    "Maintain a log of timestamps of allowed requests.",
    "On each request, evict timestamps older than `now − windowSec`.",
    "Count the remaining entries in the rolling window.",
    "Allow (and append the timestamp) if the count is below `limit`.",
  ],
  pros: [
    "Exact: the limit holds over every possible window position.",
    "No boundary-burst artifact whatsoever.",
  ],
  cons: [
    "Stores one timestamp per request — memory scales with the rate.",
    "More work per request (evict + count) than a plain counter.",
  ],
  bestFor: "Strict limits where accuracy matters more than memory.",
  params: [
    { key: "windowSec", label: "Window size", min: 2, max: 10, step: 1, default: 5, unit: "s" },
    { key: "limit", label: "Requests / window", min: 1, max: 20, step: 1, default: 8, unit: "reqs" },
  ],
};

export function create(initial) {
  let p = { ...initial };
  let log = []; // timestamps of allowed requests, ascending

  function evict(now) {
    const cutoff = now - p.windowSec;
    let i = 0;
    while (i < log.length && log[i] < cutoff) i++;
    if (i > 0) log = log.slice(i);
  }

  return {
    get params() {
      return p;
    },
    setParams(np) {
      p = { ...p, ...np };
    },
    reset() {
      log = [];
    },
    tick(now) {
      evict(now);
    },
    send(now) {
      evict(now);
      let allowed = false;
      if (log.length < p.limit) {
        log.push(now);
        allowed = true;
      }
      return { t: now, allowed, kind: allowed ? "log" : "reject" };
    },
    snapshot(now) {
      return {
        now,
        count: log.length,
        limit: p.limit,
        windowSec: p.windowSec,
        log: log.slice(),
        primary: { value: log.length, max: p.limit, mode: "load", label: "requests in window" },
      };
    },
  };
}
