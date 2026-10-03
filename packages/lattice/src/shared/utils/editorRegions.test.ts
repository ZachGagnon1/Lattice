import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("t", (value: string) => value);

import { getEditorRegionLabels } from "./editorRegions";

describe("getEditorRegionLabels", () => {
  it("uses plain default labels", () => {
    expect(getEditorRegionLabels()).toEqual({
      navigation: "Editor region navigation",
      blocks: "Blocks",
      canvas: "Email canvas",
      configuration: "Configuration",
    });
  });

  it("accepts labels from the editor configuration", () => {
    expect(getEditorRegionLabels({ canvas: "Message design" }).canvas).toBe(
      "Message design",
    );
  });
});
