import { runExperience, type ExperienceInput, type ExperienceResult } from "./adapter";
import type { DemoAdapter } from "./types";
export type MissionResult = ExperienceResult & { comparison: { on: ExperienceResult; off: ExperienceResult } };
export function authorizationOutcome(result: ExperienceResult): "none" | "permitted" | "blocked" {
  return result.requested.length === 0 ? "none" : result.executed.length > 0 ? "permitted" : "blocked";
}
export const runMission: DemoAdapter<ExperienceInput, MissionResult> = async (input, signal, onEvent) => {
  const snapshot = { ...input }; const started = performance.now();
  const selected = await runExperience(snapshot, signal, onEvent);
  const on = await runExperience({ ...snapshot, hardened: true }, signal, () => {});
  const off = await runExperience({ ...snapshot, hardened: false }, signal, () => {});
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return { ...selected, executionMs: performance.now() - started, result: { ...selected.result, comparison: { on: on.result, off: off.result } } };
};
