import { describe, expect, it } from "vitest";
import { showEditorRegion } from "./responsiveEditor";

describe("showEditorRegion", () => {
  it("shows all editor regions on a wide screen", () => {
    expect(showEditorRegion(true, "canvas", "blocks")).toBe(true);
    expect(showEditorRegion(true, "canvas", "configuration")).toBe(true);
  });

  it("shows the selected region on a narrow screen", () => {
    expect(showEditorRegion(false, "canvas", "canvas")).toBe(true);
    expect(showEditorRegion(false, "canvas", "blocks")).toBe(false);
  });
});
