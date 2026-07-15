// Leaky Bucket (as a queue)
// ------------------------------------------------------------------
// Requests pour into a bucket and "leak" out at a constant `leakRate`
// per second — i.e. they are processed at a fixed, smooth pace. The
// bucket holds at most `capacity` waiting requests; anything that
// arrives while it is full overflows and is dropped. Output is
// perfectly steady, which is its defining feature.

export const meta = {
  slug: "leaky-bucket",
  name: "Leaky Bucket",
  emoji: "💧",
  accent: "#22d3ee",
  tagline: "A perfectly smooth, constant output rate.",
  summary:
    "Incoming requests queue in a bucket that drains at a fixed rate. The steady leak shapes bursty traffic into a smooth stream; if the queue fills up, new requests overflow and are dropped.",
  howItWorks: [
    "Each accepted request joins a queue (the bucket).",
    "The queue drains at a constant `leakRate` requests per second.",
    "A new request is admitted only if the queue has room (< `capacity`).",
    "When the bucket is full, incoming requests overflow and are dropped.",
  ],
  pros: [
    "Output rate is perfectly constant — ideal for protecting a fragile downstream.",
    "Naturally smooths bursty input into a steady stream.",
  ],
  cons: [
    "Adds queueing latency; requests wait their turn.",
    "Does not allow bursts — even brief spikes overflow once full.",
  ],
  bestFor: "Traffic shaping in front of rate-sensitive backends or hardware.",
  params: [
    { key: "capacity", label: "Queue capacity", min: 1, max: 20, step: 1, default: 10, unit: "reqs" },
    { key: "leakRate", label: "Leak rate", min: 0.5, max: 10, step: 0.5, default: 2, unit: "req/s" },
  ],
};

export function create(initial) {
  let p = { ...initial };
  let level = 0; // number of requests waiting in the queue
  let last = null;
  let leaked = 0; // cumulative processed count (for outflow animation)

  function advance(now) {
    if (last == null) {
      last = now;
      return;
    }
    const dt = now - last;
    if (dt <= 0) return;
    last = now;
    const drained = Math.min(level, p.leakRate * dt);
    level -= drained;
    leaked += drained;
  }

  return {
    get params() {
      return p;
    },
    setParams(np) {
      p = { ...p, ...np };
      level = Math.min(level, p.capacity);
    },
    reset(now) {
      level = 0;
      leaked = 0;
      last = now ?? null;
    },
    tick(now) {
      advance(now);
    },
    send(now) {
      advance(now);
      let allowed = false;
      if (level < p.capacity - 1e-9) {
        level = Math.min(p.capacity, level + 1);
        allowed = true;
      }
      return { t: now, allowed, kind: allowed ? "enqueue" : "overflow" };
    },
    snapshot(now) {
      return {
        now,
        level,
        capacity: p.capacity,
        leakRate: p.leakRate,
        leaked,
        primary: { value: level, max: p.capacity, mode: "load", label: "queued requests" },
      };
    },
  };
}
