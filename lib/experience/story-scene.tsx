"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import type { GuardLayers } from "@/lib/guard/guard";
import type { MissionResult } from "./mission";
import { DESK_X, FLOOR_Y, GATE_X, LANE_Y, LIFT_X, STREET_X, doormanCells, pointAt, revealedDocs, routeEnd, walkStarts, walkerRoutes } from "./scene-state";
import { STORY } from "./story";

const STAGGER_MS = 180;
const FILL = { clean: "fill-success", stopped: "fill-info", escaped: "fill-danger" } as const;

/** Seconds each revealed document has been walking; documents set off as the trace reveals them, five at a time. */
function useWalkClock(revealed: number, durations: number[], frozen: boolean): number[] {
  const starts = useRef<number[]>([]);
  const [elapsed, setElapsed] = useState<number[]>([]);
  useEffect(() => {
    if (frozen) return;
    const s = (starts.current = walkStarts(starts.current, revealed, performance.now(), STAGGER_MS));
    let raf = 0;
    const tick = (t: number) => {
      const next = s.map((start) => Math.max(0, (t - start) / 1000));
      setElapsed(next);
      if (next.some((e, i) => e < durations[i])) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealed, durations, frozen]);
  return elapsed;
}

/**
 * `skip`: the visitor asked for the whole trace ("Show all"), so the scene jumps to its end once the frame is complete.
 * `onSettled`: fires once every document has finished walking, which is when the comparison below may appear.
 */
export function DoormanStoryScene({ frame, layers, result, locale, skip = false, onSettled }: { frame: PlaybackFrame<TraceEvent>; layers: GuardLayers; result: MissionResult; locale: "en" | "es"; skip?: boolean; onSettled?: () => void }) {
  const copy = STORY[locale].scene;
  const b = copy.building;
  const reduced = useReducedMotion();
  const jump = reduced || (skip && frame.complete);
  const items = result.items;
  const routes = useMemo(() => walkerRoutes(items), [items]);
  const durations = useMemo(() => routes.map(routeEnd), [routes]);
  const revealed = revealedDocs(frame, items.length, reduced);
  const elapsed = useWalkClock(revealed, durations, jump);
  const t = (i: number) => (jump ? Infinity : i < revealed ? (elapsed[i] ?? 0) : -1);
  const arrived = (i: number) => t(i) >= durations[i];

  const done = items.filter((_, i) => arrived(i));
  const count = (o: "clean" | "stopped" | "escaped", list = done) => list.filter((d) => d.outcome === o).length;
  const hit = new Set(done.flatMap((d) => d.executed));
  const settled = done.length === items.length;
  const onSettledRef = useRef(onSettled);
  useEffect(() => { onSettledRef.current = onSettled; });
  useEffect(() => { if (settled) onSettledRef.current?.(); }, [settled]);
  const final = { clean: count("clean", items), stopped: count("stopped", items), escaped: count("escaped", items) };
  const riding = items.findIndex((d, i) => d.outcome === "escaped" && t(i) > routes[i][3][2] && t(i) < routes[i][4][2]);
  const cabY = riding >= 0 ? pointAt(routes[riding], t(riding))[1] : LANE_Y;
  const checking = items.some((_, i) => t(i) >= routes[i][1][2] && t(i) < routes[i][2][2]);

  const room = (key: "email" | "ats", action: "email_candidate" | "write_ats", x: number, w: number) => {
    const on = hit.has(action);
    return <g data-room={key} data-hit={on}>
      <rect x={x} y={40} width={w} height={86} rx={6} className={on ? "fill-danger/10 stroke-danger" : "fill-surface stroke-border"} strokeWidth={on ? 2 : 1} />
      <text x={x + 10} y={60} className="text-[13px] sm:text-[12px] fill-foreground">{b[key]}</text>
      <text x={x + 10} y={80} fontWeight={on ? 700 : 400} className={`text-[13px] sm:text-[11px] ${on ? "fill-danger" : "fill-muted-foreground"}`}>{on ? b.hit[key] : b.untouched[key]}</text>
    </g>;
  };

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <svg viewBox="0 0 400 290" role="img" aria-label={copy.summary(final, layers)} className="block h-auto w-full select-none" data-doorman-building>
      <rect x={0} y={0} width={STREET_X} height={290} className="fill-foreground/5" />
      <text x={STREET_X / 2} y={22} textAnchor="middle" className="text-[13px] sm:text-[12px] fill-muted-foreground">{b.street}</text>
      <rect x={STREET_X} y={10} width={344} height={272} className="fill-none stroke-border" />
      <rect x={STREET_X - 2} y={204} width={4} height={60} className="fill-surface" />
      <line x1={STREET_X} y1={FLOOR_Y} x2={334} y2={FLOOR_Y} strokeWidth={3} className="stroke-border" />
      <text x={66} y={30} fontWeight={600} className="text-[13px] sm:text-[12px] fill-foreground">{b.upstairs}</text>
      {room("email", "email_candidate", 64, 130)}
      {room("ats", "write_ats", 202, 128)}

      <rect x={338} y={14} width={52} height={264} rx={3} className="fill-foreground/5 stroke-border" />
      <text x={LIFT_X} y={30} textAnchor="middle" className="text-[12px] sm:text-[11px] fill-muted-foreground">{b.lift}</text>
      <rect x={LIFT_X - 18} y={cabY - 34} width={36} height={38} rx={3} className={riding >= 0 ? "fill-none stroke-danger" : "fill-none stroke-muted-foreground"} strokeWidth={2} />

      <text x={206} y={160} textAnchor="middle" className="text-[13px] sm:text-[12px] fill-muted-foreground">{b.reception}</text>
      <line x1={148} y1={190} x2={264} y2={190} strokeWidth={3} className="stroke-border" />

      <g data-doorman={layers.rules ? "on" : "off"} opacity={layers.rules ? 1 : 0.45}>
        <circle cx={110} cy={212} r={7} className="fill-muted-foreground" />
        <rect x={102} y={220} width={16} height={18} rx={4} className="fill-info" />
        <rect x={116} y={222} width={8} height={10} className={checking ? "fill-warning" : "fill-foreground/30"} />
        <rect x={96} y={238} width={30} height={20} className="fill-surface stroke-border" />
      </g>
      <text x={DESK_X + 26} y={276} textAnchor="middle" className={`text-[13px] sm:text-[11px] ${layers.rules ? "fill-success" : "fill-muted-foreground"}`}>{b.doorman(layers.rules)}</text>

      <g data-barrier={layers.allowlist ? "on" : "off"}>
        <line x1={GATE_X} y1={206} x2={GATE_X} y2={262} strokeWidth={3} className="stroke-muted-foreground" />
        {layers.allowlist
          ? <line x1={GATE_X - 2} y1={214} x2={GATE_X - 2} y2={260} strokeWidth={6} className="stroke-success" />
          : <line x1={GATE_X} y1={208} x2={GATE_X + 20} y2={170} strokeWidth={3} strokeDasharray="4 3" className="stroke-muted-foreground" />}
      </g>
      <text x={GATE_X + 4} y={276} textAnchor="middle" className={`text-[13px] sm:text-[11px] ${layers.allowlist ? "fill-success" : "fill-muted-foreground"}`}>{b.barrier(layers.allowlist)}</text>

      {items.map((d, i) => {
        if (t(i) < 0) return null;
        const [x, y] = pointAt(routes[i], t(i));
        const decided = t(i) >= routes[i][2][2];
        return <g key={d.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} data-walker={d.id} data-outcome={decided ? d.outcome : "walking"}>
          <circle cy={-19} r={4.5} className="fill-muted-foreground" />
          <rect x={-5} y={-14} width={10} height={13} rx={3} className={decided ? FILL[d.outcome] : "fill-foreground/40"} />
          {d.hostile ? <rect x={5} y={-12} width={6} height={8} className={decided && d.outcome === "escaped" ? "fill-danger stroke-danger" : "fill-background stroke-muted-foreground"} strokeWidth={0.6} /> : null}
          {decided && d.outcome === "escaped" ? <text y={-4} fontSize={10} fontWeight={700} textAnchor="middle" className="fill-white">×</text> : null}
        </g>;
      })}
    </svg>
    <div className="mt-6">
      <OutcomeTape cells={doormanCells(items, arrived)} labels={copy.tape} ariaLabel={copy.tapeLabel(items.length)} columns={10} />
      <p className="mt-4 min-h-8 font-mono text-2xl font-semibold tracking-tight" aria-live="polite" data-scene-result>{settled ? copy.escapedOf(final.escaped) : ""}</p>
    </div>
  </StoryStage>;
}
