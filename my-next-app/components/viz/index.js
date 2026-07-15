// Maps an algorithm slug to its visualization component.
import TokenBucketViz from "./TokenBucketViz";
import LeakyBucketViz from "./LeakyBucketViz";
import FixedWindowViz from "./FixedWindowViz";
import SlidingWindowLogViz from "./SlidingWindowLogViz";
import SlidingWindowCounterViz from "./SlidingWindowCounterViz";

export const vizBySlug = {
  "token-bucket": TokenBucketViz,
  "leaky-bucket": LeakyBucketViz,
  "fixed-window": FixedWindowViz,
  "sliding-window-log": SlidingWindowLogViz,
  "sliding-window-counter": SlidingWindowCounterViz,
};
