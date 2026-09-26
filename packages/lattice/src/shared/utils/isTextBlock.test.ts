import { describe, expect, it } from "vitest";
import { isTextBlock } from "./isTextBlock";

describe("isTextBlock", () => {
  it.each(["text", "advanced_text"])("accepts %s", (type) => {
    expect(isTextBlock(type)).toBe(true);
  });

  it("rejects another block type", () => {
    expect(isTextBlock("button")).toBe(false);
  });
});
