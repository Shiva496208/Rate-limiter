"use client";

import { useMemo } from "react";
import { useSimulator } from "@/lib/useSimulator";
import { defaultParams } from "@/lib/algorithms";
import { vizBySlug } from "@/components/viz";
import Slider from "@/components/ui/Slider";
import Stat from "@/components/ui/Stat";

export default function Playground({ algo }) {
  const meta = algo.meta;
  const initial = useMemo(() => defaultParams(meta), [meta]);
  const sim = useSimulator(algo, initial);
  const Viz = vizBySlug[meta.slug];

  const allowRate =
    sim.stats.total > 0 ? Math.round((sim.stats.allowed / sim.stats.total) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      {/* Visualization */}
      <div className="panel relative flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: meta.accent }} />
            <span className="text-sm font-medium text-muted">Live simulation</span>
          </div>
          {sim.flash ? (
            <span
              key={sim.flash.id}
              className={`pop-in mono rounded-md px-2 py-1 text-[0.72rem] font-semibold ${
                sim.flash.allowed
                  ? "bg-allow/15 text-allow"
                  : "bg-deny/15 text-deny"
              }`}
            >
              {sim.flash.allowed ? "● ALLOWED" : "✕ REJECTED"}
            </span>
          ) : (
            <span className="mono text-[0.72rem] text-faint">idle</span>
          )}
        </div>

        <Viz snap={sim.snapshot} events={sim.events} accent={meta.accent} />
      </div>

      {/* Controls & telemetry */}
      <div className="flex flex-col gap-4">
        {/* Traffic */}
        <div className="panel flex flex-col gap-3 p-4">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
            Traffic generator
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-accent" onClick={sim.send}>
              Send request
            </button>
            <button className="btn" onClick={() => sim.burst(6)}>
              Burst ×6
            </button>
          </div>
          <Slider
            label="Auto traffic"
            value={sim.rps}
            min={0}
            max={20}
            step={1}
            unit="req/s"
            onChange={sim.setRps}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn"
              onClick={() => sim.setRunning(!sim.running)}
            >
              {sim.running ? "⏸ Pause auto" : "▶ Resume auto"}
            </button>
            <button className="btn" onClick={sim.reset}>
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="panel flex flex-col gap-4 p-4">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
            Parameters
          </h3>
          {meta.params.map((p) => (
            <Slider
              key={p.key}
              label={p.label}
              value={sim.params[p.key]}
              min={p.min}
              max={p.max}
              step={p.step}
              unit={p.unit}
              onChange={(v) => sim.setParams(p.key, v)}
            />
          ))}
        </div>

        {/* Telemetry */}
        <div className="panel flex flex-col gap-3 p-4">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
            Telemetry
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Total" value={sim.stats.total} />
            <Stat label="Allowed" value={sim.stats.allowed} tone="allow" />
            <Stat label="Rejected" value={sim.stats.denied} tone="deny" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[0.8rem] text-muted">Allow rate</span>
              <span className="mono tabular text-[0.8rem]">{allowRate}%</span>
            </div>
            <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-deny/40">
              <div
                className="h-full rounded-full bg-allow transition-[width] duration-300"
                style={{ width: `${allowRate}%` }}
              />
            </div>
          </div>

          {/* Event log */}
          <div className="mt-1">
            <div className="mb-1.5 text-[0.7rem] uppercase tracking-wider text-faint">
              Request log
            </div>
            <div className="no-scrollbar flex h-40 flex-col gap-1 overflow-y-auto">
              {sim.events.length === 0 ? (
                <p className="text-[0.78rem] text-faint">
                  No requests yet — hit “Send request” or raise auto traffic.
                </p>
              ) : (
                sim.events.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-md border border-border-soft bg-panel-2 px-2 py-1 text-[0.72rem]"
                  >
                    <span className="mono text-faint">t={e.t.toFixed(2)}s</span>
                    <span className="mono text-muted">{e.kind}</span>
                    <span
                      className={`mono font-semibold ${
                        e.allowed ? "text-allow" : "text-deny"
                      }`}
                    >
                      {e.allowed ? "allow" : "reject"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
