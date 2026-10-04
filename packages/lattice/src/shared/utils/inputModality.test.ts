import { describe, expect, it } from "vitest";
import { modalityForEvent } from "./inputModality";

describe("modalityForEvent", () => {
  it("treats a navigation key as keyboard use", () => {
    expect(modalityForEvent({ type: "keydown", key: "Tab" })).toBe("keyboard");
    expect(modalityForEvent({ type: "keydown", key: "F6" })).toBe("keyboard");
    expect(
      modalityForEvent({ type: "keydown", key: "Enter", altKey: true }),
    ).toBe("keyboard");
  });

  it("treats a pointer press as pointer use", () => {
    expect(modalityForEvent({ type: "pointerdown" })).toBe("pointer");
  });

  it("ignores typing, so a mouse user who types keeps the pointer mode", () => {
    expect(modalityForEvent({ type: "keydown", key: "a" })).toBeNull();
    expect(modalityForEvent({ type: "keydown", key: "Enter" })).toBeNull();
    expect(modalityForEvent({ type: "keydown", key: "ArrowDown" })).toBeNull();
  });
});
