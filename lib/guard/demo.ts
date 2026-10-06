// lib/guard/demo.ts
// Computed red-team report: attack success before/after hardening, false
// positive rate on benign resumes, and a per-attack table of what blocked.

import { ATTACKS, BENIGN } from "./corpus";
import { runGuard, type GuardLayers, type IrreversibleAction } from "./guard";

export type CorpusOutcome = "clean" | "stopped" | "escaped";
/** Which layer turned the document away: the document check, the action list, or neither. */
export type StoppedBy = "rules" | "allowlist" | null;
export type CorpusItem = { id: string; hostile: boolean; outcome: CorpusOutcome; stoppedBy: StoppedBy; executed: IrreversibleAction[] };

/** The 12 attacks then the 8 normal documents, each with what happened under the given layers. */
export function runCorpus(layers: GuardLayers): CorpusItem[] {
  const docs = [...ATTACKS.map((a) => ({ id: a.id, text: a.payload, hostile: true })), ...BENIGN.map((b) => ({ id: b.id, text: b.text, hostile: false }))];
  return docs.map((d) => {
    const r = runGuard(d.text, layers);
    const stoppedBy: StoppedBy = layers.rules && r.inputVerdict.verdict === "blocked" ? "rules" : r.blockedBy.some((b) => b.startsWith("tool:")) ? "allowlist" : null;
    const outcome: CorpusOutcome = r.executed.length > 0 ? "escaped" : d.hostile ? "stopped" : "clean";
    return { id: d.id, hostile: d.hostile, outcome, stoppedBy, executed: r.executed };
  });
}

export function getRedTeamReport() {
  const perAttack = ATTACKS.map((a) => {
    const naive = runGuard(a.payload, false);
    const hardened = runGuard(a.payload, true);
    return {
      id: a.id,
      family: a.family,
      payload: a.payload,
      naiveSucceeded: naive.executed.length > 0,
      hardenedSucceeded: hardened.executed.length > 0,
      blockedBy: hardened.blockedBy,
      firedRules: hardened.inputVerdict.firedRules.map((r) => r.id),
    };
  });

  const naiveSuccess = perAttack.filter((a) => a.naiveSucceeded).length;
  const hardenedSuccess = perAttack.filter((a) => a.hardenedSucceeded).length;

  const benignBlocked = BENIGN.filter(
    (b) => runGuard(b.text, true).inputVerdict.verdict === "blocked",
  ).length;

  return {
    naiveSuccessRate: naiveSuccess / ATTACKS.length,
    hardenedSuccessRate: hardenedSuccess / ATTACKS.length,
    falsePositiveRate: benignBlocked / BENIGN.length,
    perAttack,
    nAttacks: ATTACKS.length,
    nBenign: BENIGN.length,
    benignBlocked,
  };
}

export function getSampleGuards() {
  return BENIGN.slice(0, 4).map((b) => ({
    id: b.id,
    text: b.text,
    verdict: runGuard(b.text, true).inputVerdict,
  }));
}
