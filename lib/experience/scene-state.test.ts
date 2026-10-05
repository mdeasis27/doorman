import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { doormanCells, revealedDocs } from "./scene-state";
import { runMission } from "./mission";

it("maps documents to tape cells; final counts match the run", async () => {
  const r = (await runMission({ rules: true, allowlist: false }, new AbortController().signal, () => {})).result;
  expect(tapeCounts(doormanCells(r.items, 20))).toEqual({ served: 8, rerouted: 10, lost: 2, pending: 0 });
  expect(doormanCells(r.items, 5).slice(5).every(c => c === "pending")).toBe(true);
});

it("reveals five documents per trace step, all when complete or under reduced motion", () => {
  expect(revealedDocs({ visible: 1, total: 4, complete: false }, 20, false)).toBe(5);
  expect(revealedDocs({ visible: 4, total: 4, complete: true }, 20, false)).toBe(20);
  expect(revealedDocs({ visible: 1, total: 4, complete: false }, 20, true)).toBe(20);
});
