import { describe, expect, it } from "vitest";
import { getHeadingComponent, getTabA11yProps } from "./accessibility";

describe("accessibility helpers", () => {
  it("keeps headings inside the valid range", () => {
    expect(getHeadingComponent(2)).toBe("h2");
    expect(getHeadingComponent(5, 1)).toBe("h6");
    expect(getHeadingComponent(6, 1)).toBe("h6");
  });

  it("connects each tab to its panel", () => {
    expect(getTabA11yProps("settings", "source")).toEqual({
      id: "settings-tab-source",
      "aria-controls": "settings-tabpanel-source",
    });
  });
});
