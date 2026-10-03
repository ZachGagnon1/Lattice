import { describe, expect, it } from "vitest";

import { describeColor } from "./colorName";

describe("describeColor", () => {
  it("returns empty string for empty input", () => {
    expect(describeColor("")).toBe("");
  });

  it("returns dark slate gray for #2f4f4f", () => {
    expect(describeColor("#2f4f4f")).toBe("dark slate gray (#2F4F4F)");
  });

  it("returns red for #FF0000", () => {
    expect(describeColor("#FF0000")).toBe("red (#FF0000)");
  });

  it("returns cornflower blue for #6495ED", () => {
    expect(describeColor("#6495ED")).toBe("cornflower blue (#6495ED)");
  });

  it("returns a red-ish name for #FE0101", () => {
    expect(describeColor("#FE0101")).toMatch(/^red \(/);
  });
});
