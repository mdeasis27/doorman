import { expect, it } from "vitest";
import { runMission } from "./mission";

const run = (rules: boolean, allowlist: boolean, signal = new AbortController().signal) => runMission({ rules, allowlist }, signal, () => {});

it("the story's default bet can go either way on the two layers", async () => {
  expect((await run(true, false)).result.escaped).toBe(2);
  expect((await run(true, true)).result.escaped).toBe(0);
  expect((await run(false, true)).result.escaped).toBe(0);
  expect((await run(false, false)).result.escaped).toBe(12);
});

it("compares the chosen layers with both layers on", async () => {
  expect((await run(true, false)).result.comparison).toEqual({ mine: 2, both: 0 });
});

it("reveals the 20 documents in four steps of five", async () => {
  const r = await run(true, false);
  expect(r.result.items).toHaveLength(20);
  expect(r.trace.map((e) => e.evidenceIds?.length)).toEqual([5, 5, 5, 5]);
});

it("stops when cancelled", async () => {
  const c = new AbortController();
  await expect(runMission({ rules: true, allowlist: false }, c.signal, () => c.abort())).rejects.toMatchObject({ name: "AbortError" });
});
