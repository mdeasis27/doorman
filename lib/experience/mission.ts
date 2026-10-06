import { runCorpus } from "@/lib/guard/demo";
import type { GuardLayers } from "@/lib/guard/guard";
import type { DemoAdapter, TraceEvent } from "./types";

export type MissionResult = { items: ReturnType<typeof runCorpus>; escaped: number; comparison: { mine: number; both: number } };

const escapedCount = (items: ReturnType<typeof runCorpus>) => items.filter((i) => i.outcome === "escaped").length;
const STEP = 5;

/** Runs the 20 documents through the chosen layers; the trace reveals them five at a time. */
export const runMission: DemoAdapter<GuardLayers, MissionResult> = async (layers, signal, onEvent) => {
  const startedAt = performance.now();
  const items = runCorpus(layers);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: TraceEvent = { id: `batch-${i / STEP + 1}`, step: i / STEP + 1, kind: "guard", messageKey: `batch.${i / STEP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: items.slice(i, i + STEP).map((d) => d.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const escaped = escapedCount(items);
  return { input: layers, result: { items, escaped, comparison: { mine: escaped, both: escapedCount(runCorpus({ rules: true, allowlist: true })) } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
