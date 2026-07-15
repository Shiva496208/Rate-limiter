// Central registry of every rate-limiting algorithm.
// Each module exposes `meta` (description + tunable params) and
// `create(params)` (a pure simulator). Keeping them uniform lets the UI
// treat all algorithms interchangeably.

import * as tokenBucket from "./tokenBucket";
import * as leakyBucket from "./leakyBucket";
import * as fixedWindow from "./fixedWindow";
import * as slidingWindowLog from "./slidingWindowLog";
import * as slidingWindowCounter from "./slidingWindowCounter";

export const algorithms = [
  tokenBucket,
  leakyBucket,
  fixedWindow,
  slidingWindowLog,
  slidingWindowCounter,
];

export const algorithmsBySlug = Object.fromEntries(
  algorithms.map((a) => [a.meta.slug, a])
);

export function getAlgorithm(slug) {
  return algorithmsBySlug[slug] ?? null;
}

export function defaultParams(meta) {
  return Object.fromEntries(meta.params.map((p) => [p.key, p.default]));
}
