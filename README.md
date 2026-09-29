# Doorman

**Layered defense against prompt injection** for an agent that reads
candidate-uploaded documents (the classic hostile-input surface). Input
classification, a tool allowlist that bans irreversible actions from document
origin, output scanning, and confirmation — validated by a red-team suite.

> **Result:** Against a 12-attack red-team suite across 4 families, the naive
> "system prompt that asks nicely" lets **100%** of attacks execute an
> irreversible action, while the layered guard blocks **100%** with **0%**
> false positives on 8 benign resumes. Every block is traceable to a rule or
> the tool policy.

---

## Result

| Measure | Value |
|---|---|
| Attack success (naive) | **100%** (12/12 executed) |
| Attack success (hardened) | **0%** (0/12 executed) |
| False positives (benign) | **0%** (0/8 blocked) |
| Attacks / families | 12 / 4 (injection, jailbreak, tool-abuse, encoding) |

### The four layers

1. **Isolation** — untrusted content is data, never instructions (modeled as an
   explicit origin).
2. **Classification** — deterministic rules name *why* a document is hostile
   (`direct-injection`, `jailbreak`, `tool-abuse`, `encoding`).
3. **Tool allowlist** — irreversible actions (`email_candidate`, `write_ats`)
   can never originate from a document, even one that classifies as safe.
4. **Output scan** — detect PII, secrets and outbound URLs before a response ships.

The spec's trap is a "system prompt that politely asks the model not to fall for
tricks" — that is exactly the naive column above: 100% of attacks get through.
The control is the allowlist: even when classification misses, the agent cannot
perform the irreversible action.

---

## Architecture

```
lib/guard/
  rules.ts     # deterministic classification rules (named, traceable)
  guard.ts     # runGuard: 4-layer pipeline + action extraction
  corpus.ts    # 12 attacks + 8 benign resumes (committed)
  demo.ts      # red-team report + false-positive rate
backend/
  src/doorman/guard.py   # canonical Python implementation
  tests/                 # pinned to the same cases as the TS tests
app/               # Next.js demo: live sandbox + red-team table
```

## Design decisions & tradeoffs

1. **Deterministic rules, not a classifier model.** Regex rules are free,
   deterministic, and — crucially — auditable (the log names the rule). Their
   ceiling is known pattern coverage; a production system layers a guard model
   behind the same interface for the long tail.
2. **The allowlist is the real control.** Input classification reduces noise;
   the allowlist is what makes a fooled agent harmless. This ordering is
   deliberate and is the whole thesis of the project.
3. **Math in two languages.** TS for the browser demo, Python for the canonical
   backend, pinned by identical test cases.

## What did not work

- **The regex rules are language-specific** (Spanish + English). A multilingual
  or obfuscated attack would slip past classification — which is why the
  allowlist, not the classifier, is the backstop.
- **False-positive rate is measured on a tiny, clean resume set.** Real resumes
  are messier (they mention "email" and "approve" legitimately), which is why
  the FPR number must be re-measured on real traffic before trusting it.

## Run it

```bash
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 6 vitest tests
cd backend && uv sync --extra dev && uv run pytest   # 5 tests
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.14 · pytest
