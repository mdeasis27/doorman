import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { CorpusItem, CorpusOutcome } from "@/lib/guard/demo";

const CELL: Record<CorpusOutcome, TapeStatus> = { clean: "served", stopped: "rerouted", escaped: "lost" };

/** A tape cell fills in once its document has finished walking. */
export function doormanCells(items: readonly { outcome: CorpusOutcome }[], arrived: (i: number) => boolean): TapeStatus[] {
  return items.map((d, i) => (arrived(i) ? CELL[d.outcome] : "pending"));
}

export function revealedDocs(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

// Building geometry in SVG units (viewBox 400 x 290). Ground floor below FLOOR_Y, upstairs above it.
export const STREET_X = 56;
export const FLOOR_Y = 134;
export const LANE_Y = 250;
export const DESK_X = 84;
export const GATE_X = 296;
export const LIFT_X = 364;
export const UP_Y = 118;
export const ROOM_X = { email_candidate: 76, write_ats: 214 } as const;

/** [x, y, arrival time in seconds since the walker set off]. */
export type Waypoint = readonly [number, number, number];

/** One route per document, built from what the run says happened to it. */
export function walkerRoutes(items: readonly CorpusItem[]): Waypoint[][] {
  const n = { clean: 0, street: 0, email_candidate: 0, write_ats: 0 };
  const toStreet = (): Waypoint[] => { const k = n.street++; return [[30, LANE_Y, 0], [12 + (k % 3) * 16, 150 + Math.floor(k / 3) * 24, 0.3]]; };
  return items.map((d) => {
    const steps: Waypoint[] = [[-14, LANE_Y, 0], [DESK_X, LANE_Y, 0.6], [DESK_X, LANE_Y, 0.3]];
    if (d.outcome === "clean") steps.push([154 + n.clean++ * 14, 186, 0.6]);
    else if (d.outcome === "escaped") {
      const room = d.executed[0];
      // ponytail: one row of 8 per room; the corpus puts at most 7 attacks in one room
      steps.push([LIFT_X, LANE_Y, 0.8], [LIFT_X, UP_Y, 0.6], [ROOM_X[room] + (n[room]++ % 8) * 14, UP_Y, 0.6]);
    } else if (d.stoppedBy === "allowlist") steps.push([GATE_X - 14, LANE_Y, 0.7], [GATE_X - 14, LANE_Y, 0.3], ...stretch(toStreet(), 1));
    else steps.push(...stretch(toStreet(), 0.5));
    let t = 0;
    return steps.map(([x, y, dt]) => [x, y, (t += dt)] as const);
  });
}

const stretch = (steps: Waypoint[], first: number): Waypoint[] => steps.map((s, i) => (i === 0 ? [s[0], s[1], first] : s));

export const routeEnd = (route: readonly Waypoint[]) => route[route.length - 1][2];

export function pointAt(route: readonly Waypoint[], t: number): [number, number] {
  for (let i = 1; i < route.length; i++) {
    const [x0, y0, t0] = route[i - 1];
    const [x1, y1, t1] = route[i];
    if (t <= t1) {
      const f = t1 > t0 ? Math.max(0, (t - t0) / (t1 - t0)) : 1;
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
    }
  }
  const [x, y] = route[route.length - 1];
  return [x, y];
}
