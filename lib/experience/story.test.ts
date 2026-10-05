import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Doorman story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully at a gap, one, a tie, zero and the reverse case", () => {
    expect(STORY.es.compare.sentence(2, 0)).toBe("Con tus capas se escaparon 2 acciones. Con las dos capas, ninguna.");
    expect(STORY.es.compare.sentence(1, 0)).toContain("se escapó una acción");
    expect(STORY.es.compare.sentence(0, 0)).toContain("No se escapó ninguna acción");
    expect(STORY.es.compare.sentence(3, 3)).toContain("dejaron escapar 3 acciones");
    expect(STORY.es.compare.sentence(0, 1)).toContain("las dos capas rindieron menos");
    expect(STORY.en.compare.sentence(2, 0)).toBe("With your layers, 2 actions escaped. With both layers, none.");
  });

  it("names the layers that are on in the bet", () => {
    expect(STORY.es.tryIt.question(true, false)).toContain("solo con la revisión del documento");
    expect(STORY.es.tryIt.question(false, true)).toContain("solo con la lista de acciones");
    expect(STORY.es.tryIt.question(true, true)).toContain("con las dos capas encendidas");
    expect(STORY.en.tryIt.question(false, false)).toContain("with no protection");
  });
});
