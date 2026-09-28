import { describe, expect, it } from "vitest";
import { getCanvasElementKey } from "./canvasAccessibility";

describe("canvas accessibility", () => {
  it("does not add a false tab role or a nested tab stop", () => {
    const attributes = {
      key: getCanvasElementKey(1, "email-block text-block"),
    };

    expect(attributes).not.toHaveProperty("role");
    expect(attributes).not.toHaveProperty("tabIndex");
  });
});
