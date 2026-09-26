import { describe, expect, it } from "vitest";

import { fontStackOptions, joinFontStack, parseFontStack } from "./fontStack";

describe("parseFontStack", () => {
  it("splits a stack and trims parts", () => {
    expect(parseFontStack("Lato, Arial,  sans-serif")).toEqual([
      "Lato",
      "Arial",
      "sans-serif",
    ]);
  });

  it("returns an empty list for undefined", () => {
    expect(parseFontStack(undefined)).toEqual([]);
  });

  it("returns an empty list for an empty string", () => {
    expect(parseFontStack("")).toEqual([]);
  });

  it("drops empty parts", () => {
    expect(parseFontStack("Arial,,")).toEqual(["Arial"]);
  });
});

describe("joinFontStack", () => {
  it("trims, drops empties and duplicates", () => {
    expect(joinFontStack(["Roboto", " Arial ", "Roboto", ""])).toBe(
      "Roboto, Arial",
    );
  });

  it("round-trips through parseFontStack", () => {
    expect(joinFontStack(parseFontStack("Open Sans, Arial"))).toBe(
      "Open Sans, Arial",
    );
  });
});

describe("fontStackOptions", () => {
  it("returns unique names then generic families", () => {
    expect(
      fontStackOptions(["Lato, Arial, sans-serif", "Arial", "Georgia"]),
    ).toEqual([
      "Lato",
      "Arial",
      "sans-serif",
      "Georgia",
      "serif",
      "monospace",
      "cursive",
      "system-ui",
    ]);
  });
});
