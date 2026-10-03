// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { isEditingText } from "./contenteditable";

describe("isEditingText", () => {
  afterEach(() => document.body.replaceChildren());

  it("is true in the text", () => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    div.tabIndex = 0;
    document.body.appendChild(div);
    div.focus();
    expect(isEditingText(document)).toBe(true);
  });

  it("is true on a toolbar button", () => {
    const bar = document.createElement("div");
    bar.id = "easy-email-rich-text-bar";
    const button = document.createElement("button");
    button.tabIndex = 0;
    bar.appendChild(button);
    document.body.appendChild(bar);
    button.focus();
    expect(isEditingText(document)).toBe(true);
  });

  it("is true in a toolbar popover input", () => {
    const popup = document.createElement("div");
    popup.setAttribute("data-rich-text-toolbar-popup", "");
    const input = document.createElement("input");
    input.tabIndex = 0;
    popup.appendChild(input);
    document.body.appendChild(popup);
    input.focus();
    expect(isEditingText(document)).toBe(true);
  });

  it("is false on another button", () => {
    const button = document.createElement("button");
    button.tabIndex = 0;
    document.body.appendChild(button);
    button.focus();
    expect(isEditingText(document)).toBe(false);
  });

  it("is false with no document", () => {
    expect(isEditingText(null)).toBe(false);
  });
});
