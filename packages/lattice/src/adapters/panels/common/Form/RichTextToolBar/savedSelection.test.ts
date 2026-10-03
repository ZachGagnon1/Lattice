// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { restoreSelection, saveSelection } from "./savedSelection";

function createEditable(html: string) {
  const editable = document.createElement("div");
  editable.setAttribute("contenteditable", "true");
  editable.setAttribute("data-content_editable-idx", "content.children.0");
  editable.innerHTML = html;
  document.body.append(editable);
  return editable;
}

describe("savedSelection", () => {
  afterEach(() => document.body.replaceChildren());

  it("keeps the live range while the text is the same", () => {
    const editable = createEditable("Hello world");
    const text = editable.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 3);
    range.setEnd(text, 3);
    const saved = saveSelection(range, editable);
    expect(saved.start).toBe(3);
    const restored = restoreSelection(document, saved)!;
    expect(restored.startContainer).toBe(text);
    expect(restored.startOffset).toBe(3);
  });

  it("rebuilds the caret after a re-render", () => {
    const editable = createEditable("Hello <b>bold</b> world");
    const boldText = editable.querySelector("b")!.firstChild as Text;
    const range = document.createRange();
    range.setStart(boldText, 2);
    range.setEnd(boldText, 2);
    const saved = saveSelection(range, editable);
    expect(saved.start).toBe(8);
    editable.innerHTML = "Hello <b>bold</b> world";
    const restored = restoreSelection(document, saved)!;
    expect(restored.startContainer.textContent).toBe("bold");
    expect(restored.startOffset).toBe(2);
  });

  it("finds the block again by its path when the element is replaced", () => {
    const editable = createEditable("Hello world");
    const text = editable.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 5);
    range.setEnd(text, 5);
    const saved = saveSelection(range, editable);
    editable.remove();
    const next = createEditable("Hello world");
    const restored = restoreSelection(document, saved)!;
    expect(next.contains(restored.startContainer)).toBe(true);
    expect(restored.startOffset).toBe(5);
  });

  it("returns null when the block is gone", () => {
    const editable = createEditable("Hello world");
    const text = editable.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 5);
    range.setEnd(text, 5);
    const saved = saveSelection(range, editable);
    editable.remove();
    expect(restoreSelection(document, saved)).toBeNull();
  });

  it("clamps an offset past the end", () => {
    const editable = createEditable("Hi");
    const text = editable.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 2);
    range.setEnd(text, 2);
    const saved = saveSelection(range, editable);
    editable.innerHTML = "H";
    const restored = restoreSelection(document, saved)!;
    expect(restored.startOffset).toBe(1);
  });
});
