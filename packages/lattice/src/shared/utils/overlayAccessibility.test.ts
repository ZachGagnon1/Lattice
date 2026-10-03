import { describe, expect, it } from "vitest";
import {
  EDITOR_HOVER_COLOR,
  EDITOR_SELECTED_COLOR,
  getContrastRatio,
} from "./overlayAccessibility";

describe("editor overlay colors", () => {
  it("gives normal white text a contrast ratio of at least 4.5", () => {
    expect(
      getContrastRatio(EDITOR_HOVER_COLOR, "#ffffff"),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      getContrastRatio(EDITOR_SELECTED_COLOR, "#ffffff"),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("gives each outline a contrast ratio of at least 3", () => {
    for (const background of ["#ffffff", "#000000"]) {
      expect(
        getContrastRatio(EDITOR_HOVER_COLOR, background),
      ).toBeGreaterThanOrEqual(3);
      expect(
        getContrastRatio(EDITOR_SELECTED_COLOR, background),
      ).toBeGreaterThanOrEqual(3);
    }
  });
});
