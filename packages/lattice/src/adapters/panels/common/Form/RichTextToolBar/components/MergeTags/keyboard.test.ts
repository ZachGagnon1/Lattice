// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { moveMergeTagFocus } from "./keyboard";

describe("merge tag keyboard navigation", () => {
  it("moves focus through the tags with the arrow keys", () => {
    const container = document.createElement("div");
    const first = createTreeItem("First name");
    const second = createTreeItem("Last name");
    const third = createTreeItem("Email");
    container.append(first, second, third);
    document.body.append(container);

    first.focus();
    expect(moveMergeTagFocus(container, first, "ArrowDown")).toBe(true);
    expect(document.activeElement).toBe(second);

    expect(moveMergeTagFocus(container, second, "ArrowDown")).toBe(true);
    expect(document.activeElement).toBe(third);

    expect(moveMergeTagFocus(container, third, "ArrowUp")).toBe(true);
    expect(document.activeElement).toBe(second);
  });

  it("keeps focus at the first and last tags", () => {
    const container = document.createElement("div");
    const first = createTreeItem("First name");
    const last = createTreeItem("Email");
    container.append(first, last);
    document.body.append(container);

    first.focus();
    moveMergeTagFocus(container, first, "ArrowUp");
    expect(document.activeElement).toBe(first);

    last.focus();
    moveMergeTagFocus(container, last, "ArrowDown");
    expect(document.activeElement).toBe(last);
  });
});

function createTreeItem(label: string) {
  const item = document.createElement("div");
  item.setAttribute("role", "treeitem");
  item.tabIndex = -1;
  item.textContent = label;
  return item;
}
