"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { FlowDiagram, type FlowTone } from "@/design-system/demo/flow-diagram";
import type { GuardLayers } from "@/lib/guard/guard";
import type { MissionResult } from "./mission";
import { doormanCells, revealedDocs } from "./scene-state";
import { STORY } from "./story";

const ORDER = ["doc", "rules", "allowlist", "actions"] as const;

export function DoormanStoryScene({ frame, layers, result, locale }: { frame: PlaybackFrame<TraceEvent>; layers: GuardLayers; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const cells = doormanCells(result.items, revealedDocs(frame, result.items.length, reduced));
  const escaped = tapeCounts(cells).lost;
  const tone: Record<(typeof ORDER)[number], FlowTone> = { doc: "idle", rules: layers.rules ? "success" : "off", allowlist: layers.allowlist ? "success" : "off", actions: escaped > 0 ? "danger" : "idle" };
  const nodes = ORDER.map((id, i) => ({ id, x: 10 + i * 160, y: 15, ...copy.nodes[id], tone: tone[id] }));
  const edges = ORDER.slice(1).map((to, i) => ({ from: ORDER[i], to, tone: to === "actions" && escaped > 0 ? ("danger" as const) : undefined }));
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <FlowDiagram nodes={nodes} edges={edges} width={650} height={100} ariaLabel={copy.escapedOf(escaped)} statusLabels={copy.statusLabels} />
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.escapedOf(escaped)}</p>
    </div>
  </StoryStage>;
}
