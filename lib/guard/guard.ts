// lib/guard/guard.ts
// Layered defense for an agent that reads candidate-uploaded documents.
//
// The point (from the Doorman spec) is not a polite system prompt — it is
// isolating untrusted content and limiting what the agent may do once fooled.
// Four layers:
//   1. isolation       — the document is data, never instructions (modeled)
//   2. classification  — deterministic rules name why a document is hostile
//   3. tool allowlist  — irreversible actions can never originate from documents
//   4. output scan     — detect PII/secrets/URLs before the response ships

import { RULES } from "./rules";

export type GuardVerdict = {
  verdict: "blocked" | "safe";
  firedRules: { id: string; name: string; family: string }[];
  risk: number;
};

export type IrreversibleAction = "email_candidate" | "write_ats";

/** Layer 2: classify untrusted input, naming the rule that fired. */
export function classifyDocument(text: string): GuardVerdict {
  const firedRules = RULES.filter((r) => r.detect(text)).map((r) => ({
    id: r.id,
    name: r.name,
    family: r.family,
  }));
  return firedRules.length > 0
    ? { verdict: "blocked", firedRules, risk: Math.min(3, firedRules.length) }
    : { verdict: "safe", firedRules: [], risk: 0 };
}

/** Parse what irreversible action (if any) the document is trying to trigger. */
export function extractIrreversibleRequests(text: string): IrreversibleAction[] {
  const actions: IrreversibleAction[] = [];
  const wantsEmail = /(env[ií]a|enviar|send)/i.test(text) && /(correo|email)/i.test(text);
  if (wantsEmail) actions.push("email_candidate");
  const wantsWrite =
    /(escrib|write|marcar|mark|aprueb|aprobad|approved)/i.test(text) &&
    /(ATS|ats|aprueb|aprobad|approved)/i.test(text);
  if (wantsWrite) actions.push("write_ats");
  return [...new Set(actions)];
}

/** Layer 3: irreversible actions can never originate from a document. */
export function isActionPermitted(action: IrreversibleAction, origin: "document" | "system"): boolean {
  return origin === "system";
}

/** Layer 4: scan the agent's output for leaked data or injected links. */
export function scanOutput(output: string): { leaked: boolean; findings: string[] } {
  const findings: string[] = [];
  if (/(?:\b\d{3}[-.\s]?){2}\d{4}/.test(output)) findings.push("posible PII (patrón numérico)");
  if (/https?:\/\/[^\s]+/i.test(output)) findings.push("URL saliente en la respuesta");
  if (/API[_-]?KEY|token\s*[=:]\s*[A-Za-z0-9]{8,}/i.test(output)) findings.push("posible secreto en la respuesta");
  return { leaked: findings.length > 0, findings };
}

export type GuardResult = {
  inputVerdict: GuardVerdict;
  requested: IrreversibleAction[];
  executed: IrreversibleAction[];
  blockedBy: string[];
};

/** Two independent layers: `rules` screens the document, `allowlist` refuses every irreversible action a document asks for.
 *  `true` / `false` still mean both on / both off. */
export type GuardLayers = { rules: boolean; allowlist: boolean };

export function runGuard(document: string, hardened: boolean | GuardLayers): GuardResult {
  const layers = typeof hardened === "boolean" ? { rules: hardened, allowlist: hardened } : hardened;
  const inputVerdict = layers.rules
    ? classifyDocument(document)
    : { verdict: "safe" as const, firedRules: [], risk: 0 };

  const requested = extractIrreversibleRequests(document);
  const executed: IrreversibleAction[] = [];
  const blockedBy: string[] = [];

  const rejected = layers.rules && inputVerdict.verdict === "blocked";
  if (rejected) {
    inputVerdict.firedRules.forEach((r) => blockedBy.push(`input:${r.id}`));
  }

  for (const action of requested) {
    if (layers.allowlist) {
      // Documents can never trigger irreversible actions, even when classified safe.
      blockedBy.push(`tool:${action}`);
    } else if (!rejected) {
      executed.push(action);
    }
  }

  return { inputVerdict, requested, executed, blockedBy };
}
