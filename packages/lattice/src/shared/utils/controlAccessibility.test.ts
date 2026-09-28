import { describe, expect, it } from "vitest";
import {
  getColorControlLabel,
  getImageControlLabels,
} from "./controlAccessibility";

describe("accessible control labels", () => {
  it("gives every image action a distinct name", () => {
    expect(getImageControlLabels("Background image")).toEqual({
      upload: "Upload Background image",
      preview: "Preview Background image",
      remove: "Remove Background image",
      mergeTag: "Select a merge tag for Background image",
      suggestion: "Select a suggested value for Background image",
    });
  });

  it("includes the current color in the color control name", () => {
    expect(getColorControlLabel("Text color", "#112233")).toBe(
      "Text color: #112233",
    );
    expect(getColorControlLabel(undefined, "")).toBe("Color: transparent");
  });
});
