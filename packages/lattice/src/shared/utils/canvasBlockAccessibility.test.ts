import { describe, expect, it } from "vitest";
import { getNextBlockIndex } from "./canvasBlockAccessibility";

describe("getNextBlockIndex", () => {
  it("moves to the next and previous blocks", () => {
    expect(getNextBlockIndex(1, 4, false)).toBe(2);
    expect(getNextBlockIndex(2, 4, true)).toBe(1);
  });

  it("lets focus leave at each edge", () => {
    expect(getNextBlockIndex(0, 4, true)).toBe(-1);
    expect(getNextBlockIndex(3, 4, false)).toBe(-1);
  });
});
