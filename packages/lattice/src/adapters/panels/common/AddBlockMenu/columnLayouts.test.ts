import { describe, expect, it } from "vitest";
import { getColumnLayouts } from "./columnLayouts";

describe("getColumnLayouts", () => {
  it("lists each layout of an item, with its widths in the label", () => {
    expect(
      getColumnLayouts("2 columns", [
        ["50%", "50%"],
        ["33%", "67%"],
      ]),
    ).toEqual([
      { label: "2 columns (50% / 50%)", widths: ["50%", "50%"] },
      { label: "2 columns (33% / 67%)", widths: ["33%", "67%"] },
    ]);
  });

  it("returns no layouts for an item without a payload", () => {
    expect(getColumnLayouts("2 columns", undefined)).toEqual([]);
  });
});
