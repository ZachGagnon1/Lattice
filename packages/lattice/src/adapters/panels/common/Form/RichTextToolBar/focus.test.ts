// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  getNextIndex,
  setRovingItem,
  rememberToolbarFocus,
  takeToolbarFocus,
  getEditableFromRange,
  focusText,
  keepScrollPosition,
} from "./focus";

describe("focus", () => {
  it("wraps forward", () => {
    expect(getNextIndex("ArrowRight", 2, 3)).toBe(0);
  });

  it("wraps back", () => {
    expect(getNextIndex("ArrowLeft", 0, 3)).toBe(2);
  });

  it("handles Home and End", () => {
    expect(getNextIndex("Home", 2, 3)).toBe(0);
    expect(getNextIndex("End", 0, 3)).toBe(2);
  });

  it("returns -1 for unknown keys and empty count", () => {
    expect(getNextIndex("a", 1, 3)).toBe(-1);
    expect(getNextIndex("ArrowRight", 0, 0)).toBe(-1);
  });

  it("sets the roving tabindex", () => {
    const buttons = [
      document.createElement("button"),
      document.createElement("button"),
      document.createElement("button"),
    ];
    setRovingItem(buttons, buttons[1]);
    expect(buttons.map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("remembers and takes the toolbar focus", () => {
    rememberToolbarFocus(document, 4);
    expect(takeToolbarFocus(document)).toBe(4);
    expect(takeToolbarFocus(document)).toBeUndefined();
  });

  it("finds the editable from a range", () => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    const textNode = document.createTextNode("hello");
    div.appendChild(textNode);
    const range = document.createRange();
    range.selectNodeContents(textNode);
    expect(getEditableFromRange(range)).toBe(div);
  });

  it("focuses the editable for a connected range", () => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    div.tabIndex = 0;
    div.textContent = "Selected text";
    document.body.appendChild(div);
    const text = div.firstChild as Text;
    const range = document.createRange();
    range.selectNodeContents(text);
    focusText(range);
    expect(document.activeElement).toBe(div);
    expect(document.getSelection()?.toString()).toBe("Selected text");
  });

  it("falls back when the range nodes are detached", () => {
    const detached = document.createElement("div");
    detached.setAttribute("contenteditable", "true");
    const text = document.createTextNode("orphan");
    detached.appendChild(text);
    const range = document.createRange();
    range.selectNodeContents(text);
    const wrapper = document.createElement("div");
    const child = document.createElement("div");
    child.setAttribute("contenteditable", "true");
    child.tabIndex = 0;
    wrapper.appendChild(child);
    document.body.appendChild(wrapper);
    focusText(range, wrapper);
    expect(document.activeElement).toBe(child);
  });
});

describe("keepScrollPosition", () => {
  it("puts back the scroll position of a scrollable ancestor", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "scrollHeight", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 100 });
    const editable = document.createElement("div");
    container.append(editable);
    document.body.append(container);
    container.scrollTop = 40;

    keepScrollPosition(editable, () => {
      container.scrollTop = 200;
    });

    expect(container.scrollTop).toBe(40);
  });
});

describe("keepScrollPosition across an iframe", () => {
  it("puts back the scroll position of the page around the iframe", () => {
    const page = document.createElement("div");
    Object.defineProperty(page, "scrollHeight", { value: 900 });
    Object.defineProperty(page, "clientHeight", { value: 300 });
    const iframe = document.createElement("iframe");
    page.append(iframe);
    document.body.append(page);
    const frameDocument = iframe.contentDocument!;
    const editable = frameDocument.createElement("div");
    frameDocument.body.append(editable);
    page.scrollTop = 60;

    keepScrollPosition(editable, () => {
      page.scrollTop = 0;
    });

    expect(page.scrollTop).toBe(60);
  });
});
