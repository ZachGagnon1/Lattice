import { describe, expect, it } from "vitest";
import {
  getInlineEditAttributes,
  INLINE_EDIT_INSTRUCTIONS_ID,
} from "./inlineEditAccessibility";

describe("inline edit accessibility", () => {
  it.each([
    ["text", "Text block content", "true"],
    ["button", "Button text", "false"],
    ["navbar", "Navigation links", "false"],
  ] as const)("describes %s content", (kind, label, multiline) => {
    expect(getInlineEditAttributes(kind)).toEqual({
      role: "textbox",
      "aria-label": label,
      "aria-multiline": multiline,
      "aria-describedby": INLINE_EDIT_INSTRUCTIONS_ID,
    });
  });

  it("gives each table cell its row and column", () => {
    expect(
      getInlineEditAttributes("table", { row: 1, column: 2 }),
    ).toMatchObject({
      "aria-label": "Table cell, row 2, column 3",
      "aria-multiline": "true",
    });
  });
});
