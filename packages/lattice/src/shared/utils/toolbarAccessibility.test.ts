import { describe, expect, it } from "vitest";
import { getToolbarTargetIndex } from "./toolbarAccessibility";

describe("getToolbarTargetIndex", () => {
  it("moves through all toolbar controls", () => {
    expect(getToolbarTargetIndex(1, 4, "ArrowRight")).toBe(2);
    expect(getToolbarTargetIndex(1, 4, "ArrowLeft")).toBe(0);
    expect(getToolbarTargetIndex(2, 4, "Home")).toBe(0);
    expect(getToolbarTargetIndex(2, 4, "End")).toBe(3);
  });

  it("wraps at both ends", () => {
    expect(getToolbarTargetIndex(3, 4, "ArrowRight")).toBe(0);
    expect(getToolbarTargetIndex(0, 4, "ArrowLeft")).toBe(3);
  });
});
