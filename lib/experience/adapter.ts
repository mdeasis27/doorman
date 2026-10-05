import { runGuard } from "@/lib/guard/guard";
import type { DemoAdapter, TraceEvent } from "./types";

export type ExperienceInput = { document: string; hardened: boolean };
export type ExperienceResult = ReturnType<typeof runGuard>;

export const runExperience: DemoAdapter<ExperienceInput, ExperienceResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  if (!input.document.trim()) throw new Error("A document is required.");
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const events: TraceEvent[] = [
    { id: "isolate", step: 1, kind: "guard", messageKey: "document-isolated", timestampMs: performance.now() - startedAt },
    { id: "classify", step: 2, kind: "guard", messageKey: "rules-evaluated", timestampMs: performance.now() - startedAt },
  ];
  for (const event of events) { if (signal.aborted) throw new DOMException("Aborted", "AbortError"); onEvent(event); if (signal.aborted) throw new DOMException("Aborted", "AbortError"); }
  const result = runGuard(input.document, input.hardened);
  const finalEvent: TraceEvent = { id: "policy", step: 3, kind: "decision", messageKey: result.blockedBy.length ? "operations-blocked" : "operations-permitted", timestampMs: performance.now() - startedAt, evidenceIds: result.inputVerdict.firedRules.map((rule) => rule.id) };
  if (signal.aborted) throw new DOMException("Aborted", "AbortError"); onEvent(finalEvent); if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return { input, result, trace: [...events, finalEvent], executionMs: performance.now() - startedAt, mode: "local" };
};
