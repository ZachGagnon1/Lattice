const TOOLBAR_ITEM_SELECTOR = "button:not(:disabled)";

// The toolbar can re-render during a command. Keep the index, not the node.
const focusBeforeUnmount = new WeakMap<Document, number>();

export function getToolbarItems(toolbar: HTMLElement | null | undefined) {
  return Array.from(
    toolbar?.querySelectorAll<HTMLButtonElement>(TOOLBAR_ITEM_SELECTOR) ?? [],
  );
}

export function getNextIndex(key: string, current: number, count: number) {
  if (count === 0) return -1;
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return -1;
  }
}

/** Makes `active` the only item in the Tab order (the roving tabindex pattern). */
export function setRovingItem(items: HTMLElement[], active: HTMLElement) {
  items.forEach((item) => {
    item.tabIndex = item === active ? 0 : -1;
  });
}

export function rememberToolbarFocus(document: Document, index: number) {
  focusBeforeUnmount.set(document, index);
}

export function takeToolbarFocus(document: Document) {
  const index = focusBeforeUnmount.get(document);
  focusBeforeUnmount.delete(document);
  return index;
}

export function getEditableFromRange(range: Range | null | undefined) {
  const node = range?.commonAncestorContainer;
  const element =
    node?.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node?.parentElement;
  return element?.closest<HTMLElement>('[contenteditable="true"]') ?? null;
}

function isSameRange(a: Range, b: Range) {
  return (
    a.startContainer === b.startContainer &&
    a.startOffset === b.startOffset &&
    a.endContainer === b.endContainer &&
    a.endOffset === b.endOffset
  );
}

/**
 * Puts `range` back as the document selection.
 * A new selection clears the pending caret format, such as bold on an empty caret.
 * The function therefore does nothing when the selection already matches.
 */
export function selectRange(range: Range) {
  const selection = range.startContainer.ownerDocument?.getSelection();
  if (!selection) return;
  const current = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  if (current && isSameRange(current, range)) return;
  selection.removeAllRanges();
  selection.addRange(range.cloneRange());
}

/**
 * Moves the focus back to the text that owns `range`.
 * `fallback` gets the focus when a re-render removed the nodes of the range.
 */
export function focusText(
  range: Range | null | undefined,
  fallback?: HTMLElement | null,
) {
  const editable = getEditableFromRange(range);
  if (range && editable?.isConnected) {
    editable.focus({ preventScroll: true });
    selectRange(range);
    return;
  }
  const target = fallback?.matches('[contenteditable="true"]')
    ? fallback
    : fallback?.querySelector<HTMLElement>('[contenteditable="true"]');
  target?.focus({ preventScroll: true });
}

/**
 * Runs `action` and then puts back the scroll position of each ancestor of `element`.
 * The browser scrolls the selection into view after a command, but a format command does not move the caret.
 * The walk goes past the iframe, because the browser also scrolls the page around the iframe.
 */
export function keepScrollPosition(element: HTMLElement, action: () => void) {
  const positions: Array<[Element, number, number]> = [];
  let node: Element | null | undefined = element.parentElement;
  while (node) {
    if (
      node.scrollHeight > node.clientHeight ||
      node.scrollWidth > node.clientWidth
    ) {
      positions.push([node, node.scrollTop, node.scrollLeft]);
    }
    node = node.parentElement ?? node.ownerDocument.defaultView?.frameElement;
  }
  action();
  positions.forEach(([scroller, top, left]) => {
    scroller.scrollTop = top;
    scroller.scrollLeft = left;
  });
}
