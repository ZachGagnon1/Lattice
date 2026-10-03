import { DATA_CONTENT_EDITABLE_IDX } from "@/constants";

/**
 * The caret position in a text block, kept while the toolbar has the focus.
 * A re-render replaces the text nodes, and the browser then moves a live range to the start.
 * The text offsets and the field path survive that.
 */
export interface SavedSelection {
  range: Range;
  editable: HTMLElement;
  path: string | null;
  start: number;
  end: number;
}

function textOffset(editable: HTMLElement, node: Node, offset: number) {
  const range = editable.ownerDocument.createRange();
  range.selectNodeContents(editable);
  range.setEnd(node, offset);
  return range.toString().length;
}

function pointAt(editable: HTMLElement, offset: number): [Node, number] {
  const walker = editable.ownerDocument.createTreeWalker(
    editable,
    NodeFilter.SHOW_TEXT,
  );
  let remaining = offset;
  let last: Text | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    if (remaining <= text.length) return [text, remaining];
    remaining -= text.length;
    last = text;
  }
  return last ? [last, last.length] : [editable, editable.childNodes.length];
}

export function saveSelection(
  range: Range,
  editable: HTMLElement,
): SavedSelection {
  return {
    range: range.cloneRange(),
    editable,
    path: editable.getAttribute(DATA_CONTENT_EDITABLE_IDX),
    start: textOffset(editable, range.startContainer, range.startOffset),
    end: textOffset(editable, range.endContainer, range.endOffset),
  };
}

export function findEditable(document: Document, saved: SavedSelection) {
  if (saved.editable.isConnected) return saved.editable;
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(`[${DATA_CONTENT_EDITABLE_IDX}]`),
    ).find(
      (element) =>
        element.getAttribute(DATA_CONTENT_EDITABLE_IDX) === saved.path,
    ) ?? null
  );
}

/** Returns a range for the saved caret in the current DOM, or `null` when the text block is gone. */
export function restoreSelection(document: Document, saved: SavedSelection) {
  const editable = findEditable(document, saved);
  if (!editable) return null;

  // The live range is exact, also after a line break, so prefer it while it still points at the same text.
  const { range } = saved;
  const liveIsValid =
    editable.contains(range.startContainer) &&
    editable.contains(range.endContainer) &&
    textOffset(editable, range.startContainer, range.startOffset) ===
      saved.start &&
    textOffset(editable, range.endContainer, range.endOffset) === saved.end;
  if (liveIsValid) return range;

  const rebuilt = document.createRange();
  rebuilt.setStart(...pointAt(editable, saved.start));
  rebuilt.setEnd(...pointAt(editable, saved.end));
  return rebuilt;
}
