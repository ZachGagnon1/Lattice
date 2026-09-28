import { describe, expect, it } from "vitest";
import {
  getActiveIndexAfterRemoval,
  getRepeatItemLabel,
} from "./repeatItemAccessibility";

describe("repeat-item accessibility", () => {
  it("keeps a valid active tab after removal", () => {
    expect(getActiveIndexAfterRemoval(2, 2, 3)).toBe(1);
    expect(getActiveIndexAfterRemoval(2, 0, 4)).toBe(1);
    expect(getActiveIndexAfterRemoval(0, 2, 4)).toBe(0);
  });

  it("creates a numbered item name", () => {
    expect(getRepeatItemLabel("Slide", 1)).toBe("Slide 2");
    expect(getRepeatItemLabel(undefined, 0)).toBe("Item 1");
  });
});
