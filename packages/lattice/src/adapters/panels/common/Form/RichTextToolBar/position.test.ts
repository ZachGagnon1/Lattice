import { describe, expect, it } from "vitest";
import { getToolbarStyle } from "./position";

describe("getToolbarStyle", () => {
  it("centers the toolbar and keeps it inside the canvas width", () => {
    const style = getToolbarStyle({ top: 100, bottom: 140 });
    expect(style).toMatchObject({
      left: 0,
      right: 0,
      margin: "0 auto",
      width: "fit-content",
      maxWidth: "100%",
      boxSizing: "border-box",
    });
  });

  it("places the toolbar above the block", () => {
    expect(getToolbarStyle({ top: 100, bottom: 140 }).top).toBe(55);
  });

  it("places the toolbar below a block near the top", () => {
    expect(getToolbarStyle({ top: 20, bottom: 60 }).top).toBe(70);
  });

  it("places a wrapped toolbar above the block by its measured height", () => {
    expect(getToolbarStyle({ top: 100, bottom: 140 }, 70).top).toBe(20);
  });

  it("places a wrapped toolbar below the block when it does not fit above", () => {
    expect(getToolbarStyle({ top: 60, bottom: 100 }, 70).top).toBe(110);
  });
});
