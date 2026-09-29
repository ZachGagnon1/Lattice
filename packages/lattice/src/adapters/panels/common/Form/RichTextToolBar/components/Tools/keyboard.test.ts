import { describe, expect, it } from "vitest";
// @vitest-environment jsdom

import { getEditableFromRange, isToolbarExitKey } from "./keyboard";

describe("toolbar exit keys", () => {
  it.each(["Escape", "Tab"])("accepts %s on a toolbar button", (key) => {
    expect(isToolbarExitKey(key, 0)).toBe(true);
  });

  it("keeps Escape available inside a toolbar popup", () => {
    expect(isToolbarExitKey("Escape", -1)).toBe(false);
  });

  it("finds the text field that owns the saved range", () => {
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    const text = document.createTextNode("Text content");
    editable.append(text);
    const range = document.createRange();
    range.selectNodeContents(text);

    expect(getEditableFromRange(range)).toBe(editable);
  });
});
