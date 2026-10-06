import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { CorpusOutcome } from "@/lib/guard/demo";

const CELL: Record<CorpusOutcome, TapeStatus> = { clean: "served", stopped: "rerouted", escaped: "lost" };

export function doormanCells(items: readonly { outcome: CorpusOutcome }[], revealed: number): TapeStatus[] {
  return items.map((d, i) => (i >= revealed ? "pending" : CELL[d.outcome]));
}

export function revealedDocs(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };
