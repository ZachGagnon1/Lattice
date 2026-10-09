import { describe, expect, it } from "vitest";

import { nearestHtmlColorName } from "./colorName";
import COLOR_NAMER_SAMPLE from "./colorNamerSample.json";

// color-namer 1.4.0 gave these names before the inline table replaced it (issue #161).
describe("nearestHtmlColorName", () => {
  it("gives the same name as color-namer for each sample color", () => {
    const mismatches = Object.entries(COLOR_NAMER_SAMPLE).filter(
      ([hex, name]) => nearestHtmlColorName(hex) !== name,
    );
    expect(mismatches).toEqual([]);
  });
});
