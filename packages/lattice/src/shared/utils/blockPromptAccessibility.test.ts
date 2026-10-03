import { describe, expect, it } from "vitest";
import {
  getBlockStateOutline,
  shouldShowHoverPrompt,
} from "./blockPromptAccessibility";

describe("block prompt accessibility", () => {
  it("does not duplicate the selected block prompt", () => {
    expect(shouldShowHoverPrompt("block-1", "block-1", false)).toBe(false);
    expect(shouldShowHoverPrompt("block-1", "block-2", false)).toBe(true);
  });

  it("uses different line patterns for hover and selected states", () => {
    expect(getBlockStateOutline("hover", "blue")).toBe("1px dashed blue");
    expect(getBlockStateOutline("selected", "blue")).toBe("2px solid blue");
  });
});
