import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { doormanCells, revealedDocs, walkerRoutes, pointAt, routeEnd, FLOOR_Y, STREET_X } from "./scene-state";
import { runMission } from "./mission";

const items = async (rules: boolean, allowlist: boolean) => (await runMission({ rules, allowlist }, new AbortController().signal, () => {})).result.items;

it("maps arrived documents to tape cells; final counts match the run", async () => {
  const r = await items(true, false);
  expect(tapeCounts(doormanCells(r, () => true))).toEqual({ served: 8, rerouted: 10, lost: 2, pending: 0 });
  expect(doormanCells(r, (i) => i < 5).slice(5).every(c => c === "pending")).toBe(true);
});

it("reveals five documents per trace step, all when complete or under reduced motion", () => {
  expect(revealedDocs({ visible: 1, total: 4, complete: false }, 20, false)).toBe(5);
  expect(revealedDocs({ visible: 4, total: 4, complete: true }, 20, false)).toBe(20);
  expect(revealedDocs({ visible: 1, total: 4, complete: false }, 20, true)).toBe(20);
});

it("routes follow the run: escaped attacks go upstairs, stopped ones end in the street, normal ones stay at reception", async () => {
  const r = await items(true, true);
  const routes = walkerRoutes(r);
  const end = (id: string) => pointAt(routes[r.findIndex((d) => d.id === id)], Infinity);
  expect(end("a01")[0]).toBeLessThan(STREET_X); // doorman sent it back
  expect(end("b01")[0]).toBeGreaterThan(STREET_X);
  expect(end("b01")[1]).toBeGreaterThan(FLOOR_Y);
  // a03 passed the doorman: the barrier stopped it, so it reaches the gate before going back out
  const a03 = routes[r.findIndex((d) => d.id === "a03")];
  expect(Math.max(...a03.map((p) => p[0]))).toBeGreaterThan(Math.max(...routes[0].map((p) => p[0])));
  expect(end("a03")[0]).toBeLessThan(STREET_X);
  expect(routes.every((route) => route.every((p) => p[1] > FLOOR_Y))).toBe(true);

  const open = await items(true, false);
  const up = walkerRoutes(open);
  const escaped = open.flatMap((d, i) => (d.outcome === "escaped" ? [pointAt(up[i], Infinity)] : []));
  expect(escaped).toHaveLength(2);
  expect(escaped.every(([, y]) => y < FLOOR_Y)).toBe(true);
});

it("interpolates between waypoints and settles at the last one", () => {
  const route = [[0, 0, 0], [10, 0, 1], [10, 20, 2]] as const;
  expect(pointAt(route, -1)).toEqual([0, 0]);
  expect(pointAt(route, 0.5)).toEqual([5, 0]);
  expect(pointAt(route, 1.5)).toEqual([10, 10]);
  expect(pointAt(route, 9)).toEqual([10, 20]);
  expect(routeEnd(route)).toBe(2);
});
