"use client";

// useSimulator — drives any algorithm simulator on a real-time clock.
// ------------------------------------------------------------------
// A requestAnimationFrame loop advances a virtual clock, generates
// automatic traffic at `rps`, ticks the simulator and publishes a fresh
// snapshot every frame for smooth animation. Manual actions (send /
// burst / reset / parameter changes) publish a snapshot immediately too,
// so the UI stays correct even when rAF is throttled (e.g. a background
// tab) — the virtual clock is read from performance.now() on demand, so
// time-based state (refill, leaks, window expiry) is always up to date.

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_EVENTS = 60;

export function useSimulator(algo, initialParams) {
  const simRef = useRef(null);
  const clockRef = useRef({ t0: 0, lastFrame: 0 });
  const pendingRef = useRef(0);
  const rafRef = useRef(0);
  const idRef = useRef(0);
  const rpsRef = useRef(0);
  const runningRef = useRef(true);

  const [snapshot, setSnapshot] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, allowed: 0, denied: 0 });
  const [params, setParamsState] = useState(initialParams);
  const [rps, setRpsState] = useState(0);
  const [running, setRunningState] = useState(true);
  const [flash, setFlash] = useState(null);

  const nowSec = useCallback(
    () => (performance.now() - clockRef.current.t0) / 1000,
    []
  );

  const publish = useCallback((now) => {
    const sim = simRef.current;
    if (sim) setSnapshot(sim.snapshot(now));
  }, []);

  // (Re)create the simulator whenever the algorithm changes.
  useEffect(() => {
    const now = performance.now();
    clockRef.current.t0 = now;
    clockRef.current.lastFrame = now;
    simRef.current = algo.create(initialParams);
    pendingRef.current = 0;
    setStats({ total: 0, allowed: 0, denied: 0 });
    setEvents([]);
    setFlash(null);
    setSnapshot(simRef.current.snapshot(0)); // render initial state at once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo]);

  const record = useCallback((ev) => {
    ev.id = ++idRef.current;
    setFlash({ allowed: ev.allowed, id: ev.id });
    setStats((s) => ({
      total: s.total + 1,
      allowed: s.allowed + (ev.allowed ? 1 : 0),
      denied: s.denied + (ev.allowed ? 0 : 1),
    }));
    setEvents((list) => {
      const next = [ev, ...list];
      if (next.length > MAX_EVENTS) next.length = MAX_EVENTS;
      return next;
    });
  }, []);

  // Main animation loop (smooth updates while the tab is visible).
  useEffect(() => {
    const loop = () => {
      const c = clockRef.current;
      const perf = performance.now();
      const now = (perf - c.t0) / 1000;
      const dt = Math.min(0.1, (perf - c.lastFrame) / 1000);
      c.lastFrame = perf;

      const sim = simRef.current;
      if (sim) {
        sim.tick(now);
        if (runningRef.current && rpsRef.current > 0) {
          pendingRef.current += rpsRef.current * dt;
          let guard = 0;
          while (pendingRef.current >= 1 && guard < 50) {
            pendingRef.current -= 1;
            record(sim.send(now));
            guard++;
          }
        }
        setSnapshot(sim.snapshot(now));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [record]);

  const send = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    const now = nowSec();
    record(sim.send(now));
    publish(now);
  }, [record, publish, nowSec]);

  const burst = useCallback(
    (n = 6) => {
      const sim = simRef.current;
      if (!sim) return;
      const now = nowSec();
      for (let i = 0; i < n; i++) record(sim.send(now));
      publish(now);
    },
    [record, publish, nowSec]
  );

  const setParams = useCallback(
    (key, value) => {
      setParamsState((prev) => {
        const next = { ...prev, [key]: value };
        simRef.current?.setParams(next);
        return next;
      });
      publish(nowSec());
    },
    [publish, nowSec]
  );

  const setRps = useCallback((v) => {
    rpsRef.current = v;
    setRpsState(v);
  }, []);

  const setRunning = useCallback((v) => {
    runningRef.current = v;
    setRunningState(v);
  }, []);

  const reset = useCallback(() => {
    const now = nowSec();
    simRef.current?.reset(now);
    pendingRef.current = 0;
    setStats({ total: 0, allowed: 0, denied: 0 });
    setEvents([]);
    setFlash(null);
    publish(now);
  }, [publish, nowSec]);

  return {
    snapshot,
    events,
    stats,
    params,
    rps,
    running,
    flash,
    send,
    burst,
    reset,
    setParams,
    setRps,
    setRunning,
  };
}
