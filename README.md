# Agent input guard

[Español](README.es.md) · [Try the demo](https://doorman-manueldeasis27-2515s-projects.vercel.app/en/app) · [Case study](https://manueldeasis.com/en/projects/doorman) · [Source](https://github.com/mdeasis27/doorman)

![Actual interactive local interface](docs/images/cover.png)

Edit a document and tool policy to see which rules permit, block or escalate a request.

## Two situations to compare

**Policy on:** Hostile document requesting an approval email; policy enabled. Rules block the external action.

![Policy on](docs/images/scenario-a.png)

**Benign summary without policy:** Benign document requesting a summary; policy disabled. The local summary action is allowed; no external action is executed.

![Benign summary without policy](docs/images/scenario-b.png)

## Business use case

Instructions embedded in an untrusted document can trigger an unsafe agent action.

**Who uses it:** Document-review operations lead.

**The decision:** Permit or block an external action after document review.

Choose policy on or off, inspect hostile document rules, then read the action decision.

### Try the decision

**Policy on:** Hostile document requesting an approval email; policy enabled. Rules block the external action.

**Benign summary without policy:** Benign document requesting a summary; policy disabled. The local summary action is allowed; no external action is executed.

Choose a scenario, edit its controls and run the local computation. Step through the visual process or reveal all steps. Reset before comparing the second scenario.

## How to try it

Open `/en/app` (English, default) or `/es/app` (Spanish). Change the scenario inputs and run the computation. Inspect the resulting decision, evidence and computed trace. Playback reveals completed local steps; it does not measure a live model. Reset starts a new local scenario. Changing language resets the scenario.

The primary demo needs no account, API key or database. Public links refer to the existing deployment; local redesign changes are pending publication.

<!-- recruiter-mission:start -->
### Your interactive mission

Load unprotected hostile instructions, inspect the document, optionally predict authorization, block or no requested action, then reveal the policy comparison.

Compute policy on and off for the identical document. Inspect requested operations, simulated permitted operations, lexical rule IDs and policy blocks. No email is sent and no ATS write occurs. Benign inputs can produce equal outcomes.

**Why this approach:** Local lexical rules and document-origin action restrictions separate content from authority. The action allowlist can block even when no lexical rule fires; these rules are not a comprehensive injection defense.

**Before production:** Isolate tools, validate permissions, audit decisions and test false positives and missed attacks before connecting a real agent.

Editing inputs, choosing a preset or resetting clears the prediction and obsolete results. Comparisons appear only at completed playback; the primary demos need no account or key.

This batch changes the implementation. Existing screenshots and browser reports document the previous stage. Fresh captures, browser interaction, mobile and HTTP verification remain pending under the documented tool denials. Prior owner visual approval covers the earlier six-mission pilot, not this batch.
<!-- recruiter-mission:end -->

## Local setup and verification

Requires Node.js 22 and pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
node node_modules/typescript/bin/tsc --noEmit --incremental false
pnpm lint
pnpm build
```

Open `http://localhost:3000/en/app`. Recorded validation covers tests, lint, TypeScript and production builds. See [command results](docs/quality/decision-lab-verification.json) and [browser component checks](docs/quality/decision-lab-browser.json). The new browser checks exercise real React components and production CSS with controlled locale navigation; they do not certify Next routes or public deployment.

## Architecture

- `app/[lang]/`: localized browser experience.
- `lib/experience/`: typed local adapter, validation and run traces.
- `design-system/`: shared visual tokens, locale controls and execution/replay presentation.
- `app/api/`: optional server integrations; the primary demo does not require them.

Technology: Next.js 16, TypeScript, Python, Vitest, pytest, Tailwind CSS v4.

## Evidence and limitations

Document instructions pass through a rule gate to an action card.

Inspectable guard paths and fired rules; no tool action executes.

Makes the policy boundary visible before an agent acts.

**Limits:** The document and rules are local examples; no external action is attempted. The presets change both document and policy; toggle policy on the same document to isolate its effect. These portfolio prototypes do not claim measured production impact.

Inputs use fictional or anonymized examples. Optional live integrations require their own credentials and operational setup. Secrets belong in the configured secret manager, never in local secret files or Git. Use the existing `infisical run -- <command>` workflow when live integration is needed. This repository does not publish or deploy automatically as part of the local demo.

![Actual English demo capture](docs/images/demo.png)
