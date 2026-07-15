// Token Bucket
// ------------------------------------------------------------------
// A bucket holds up to `capacity` tokens and is refilled at a steady
// `refillRate` tokens/second. Every request must take one token; if the
// bucket is empty the request is rejected. Because tokens accumulate up
// to the cap, the bucket tolerates short bursts while enforcing a long
// run average equal to the refill rate.

export const meta = {
  slug: "token-bucket",
  name: "Token Bucket",
  emoji: "🪙",
  accent: "#6366f1",
  tagline: "Bursts allowed, steady average enforced.",
  summary:
    "Tokens drip into a bucket at a fixed rate. Each request spends one token; an empty bucket means rejection. Saved-up tokens let clients burst up to the bucket's capacity.",
  howItWorks: [
    "The bucket starts full with `capacity` tokens.",
    "Tokens are added continuously at `refillRate` per second, never exceeding capacity.",
    "An incoming request removes exactly one token and is allowed.",
    "If no whole token is available, the request is rejected — no queueing.",
  ],
  pros: [
    "Permits controlled bursts up to the bucket size.",
    "Smooth, memory-cheap: only a counter and a timestamp per client.",
    "Long-term rate is exactly the refill rate.",
  ],
  cons: [
    "A large capacity can let a big burst through all at once.",
    "Choosing capacity vs. refill rate takes tuning.",
  ],
  bestFor: "Public APIs that want to be forgiving of short spikes.",
  params: [
    { key: "capacity", label: "Bucket capacity", min: 1, max: 20, step: 1, default: 10, unit: "tokens" },
    { key: "refillRate", label: "Refill rate", min: 0.5, max: 10, step: 0.5, default: 2, unit: "tok/s" },
  ],
};

export function create(initial) {
  let p = { ...initial };
  let tokens = p.capacity;
  let last = null;

  function advance(now) {
    if (last == null) {
      last = now;
      return;
    }
    const dt = now - last;
    if (dt <= 0) return;
    last = now;
    tokens = Math.min(p.capacity, tokens + p.refillRate * dt);
  }

  return {
    get params() {
      return p;
    },
    setParams(np) {
      p = { ...p, ...np };
      tokens = Math.min(tokens, p.capacity);
    },
    reset(now) {
      tokens = p.capacity;
      last = now ?? null;
    },
    tick(now) {
      advance(now);
    },
    send(now) {
      advance(now);
      let allowed = false;
      if (tokens >= 1) {
        tokens -= 1;
        allowed = true;
      }
      return { t: now, allowed, kind: allowed ? "consume" : "reject" };
    },
    snapshot(now) {
      return {
        now,
        tokens,
        capacity: p.capacity,
        refillRate: p.refillRate,
        primary: { value: tokens, max: p.capacity, mode: "capacity", label: "tokens available" },
      };
    },
  };
}
