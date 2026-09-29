// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  keepToolbarControlFocus,
  restoreToolbarControlFocus,
  returnFocusToText,
} from "./focus";

describe("rich text toolbar focus", () => {
  it("restores the active control after the toolbar changes", () => {
    const firstToolbar = createToolbar("Bold");
    const firstButton = firstToolbar.querySelector("button")!;
    keepToolbarControlFocus(firstButton, true);

    const nextToolbar = createToolbar("Bold");
    firstToolbar.remove();
    restoreToolbarControlFocus(nextToolbar);

    const nextButton = nextToolbar.querySelector("button")!;
    expect(document.activeElement).toBe(nextButton);
    expect(nextButton.getAttribute("data-keyboard-focus")).toBe("true");
  });

  it("returns focus to the text that owns the selection", () => {
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    editable.tabIndex = 0;
    const text = document.createTextNode("Selected text");
    editable.append(text);
    document.body.append(editable);
    const range = document.createRange();
    range.selectNodeContents(text);

    returnFocusToText(range);

    expect(document.activeElement).toBe(editable);
    expect(document.getSelection()?.toString()).toBe("Selected text");
  });
});

function createToolbar(label: string) {
  const toolbar = document.createElement("div");
  toolbar.setAttribute("role", "toolbar");
  const button = document.createElement("button");
  button.setAttribute("aria-label", label);
  toolbar.append(button);
  document.body.append(toolbar);
  return toolbar;
}
