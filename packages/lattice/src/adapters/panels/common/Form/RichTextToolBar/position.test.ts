import { describe, expect, it } from "vitest";
import { getToolbarStyle } from "./position";

describe("getToolbarStyle", () => {
  it("keeps the toolbar inside the canvas width", () => {
    const style = getToolbarStyle({ top: 100, bottom: 140 });
    expect(style.maxWidth).toBe("100%");
    expect(style.boxSizing).toBe("border-box");
  });

  it("places the toolbar above the block", () => {
    const style = getToolbarStyle({ top: 100, bottom: 140 });
    expect(style.top).toBe(55);
  });

  it("places the toolbar below a block near the top", () => {
    const style = getToolbarStyle({ top: 20, bottom: 60 });
    expect(style.top).toBe(70);
  });
});
