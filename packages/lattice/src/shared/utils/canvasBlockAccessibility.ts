import { BlockManager } from "@/domain/blocks/BlockManager";
import {
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
} from "@/domain/blocks/block";
import { BasicType, EMAIL_BLOCK_CLASS_NAME } from "@/domain/constants";
import { isTextBlock } from "./isTextBlock";

export const BLOCK_SELECTION_SURFACE = "data-block-selection-surface";
export const BLOCK_SELECTION_INSTRUCTIONS = "block-selection-instructions";
export const BLOCK_KEYBOARD_HINT_CLASS = "block-keyboard-hint";
export const TOOLBAR_KEYBOARD_HINT_CLASS = "block-toolbar-keyboard-hint";
export const TABLE_CELL_HINT_CLASS = "table-cell-keyboard-hint";
export const TABLE_EDIT_HINT_CLASS = "table-edit-keyboard-hint";
/** Marks the hidden button of a table cell. The value is `row-column`. */
export const TABLE_CELL_CONTROL = "data-table-cell-control";
/** Marks the cell that Tab returns to in each table. */
export const TABLE_CELL_ACTIVE = "data-table-cell-active";

const EDITABLE_SELECTOR = '[contenteditable="true"]';

export function getNextBlockIndex(
  currentIndex: number,
  itemCount: number,
  backwards: boolean,
) {
  const nextIndex = currentIndex + (backwards ? -1 : 1);
  return nextIndex >= 0 && nextIndex < itemCount ? nextIndex : -1;
}

function setVisuallyHiddenStyle(button: HTMLButtonElement) {
  Object.assign(button.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });
}

function getSelectionButton(block: HTMLElement) {
  return block.querySelector<HTMLButtonElement>(
    `:scope > button[${BLOCK_SELECTION_SURFACE}]`,
  );
}

/** A text block takes the focus in its text, so the user can type at once. */
function getTabTarget(block: HTMLElement, idx: string, type: string) {
  if (isTextBlock(type)) {
    const editable = block.querySelector<HTMLElement>(EDITABLE_SELECTOR);
    if (editable) {
      getSelectionButton(block)?.remove();
      editable.setAttribute(BLOCK_SELECTION_SURFACE, idx);
      // Enter types a new line in the text, so only Alt+Enter is a shortcut there.
      editable.setAttribute("aria-keyshortcuts", "Alt+Enter");
      return editable;
    }
  }

  let button = getSelectionButton(block);
  if (!button) {
    button = block.ownerDocument.createElement("button");
    button.type = "button";
    button.setAttribute(BLOCK_SELECTION_SURFACE, idx);
    button.setAttribute("aria-describedby", BLOCK_SELECTION_INSTRUCTIONS);
    button.setAttribute("aria-keyshortcuts", "Enter Alt+Enter");
    setVisuallyHiddenStyle(button);
    block.prepend(button);
  }
  const blockName = BlockManager.getBlockByType(type)?.name ?? type;
  button.setAttribute(
    "aria-label",
    `${t("Select")} ${blockName} ${t("block")}`,
  );
  return button;
}

// The canvas is in an iframe, so `instanceof HTMLButtonElement` is always false there.
function isSelectionButton(target: HTMLElement) {
  return target.tagName === "BUTTON";
}

export function focusEditableAtEnd(editable: HTMLElement) {
  editable.focus();
  const selection = editable.ownerDocument.getSelection();
  if (!selection) return;
  const range = editable.ownerDocument.createRange();
  range.selectNodeContents(editable);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function focusTarget(target: HTMLElement) {
  if (target.isContentEditable) focusEditableAtEnd(target);
  else target.focus();
}

/** A table takes the focus in its cells, so the arrow keys work at once. */
function findTabTarget(block: HTMLElement, type: string) {
  if (type === BasicType.TABLE) {
    const cell =
      block.querySelector<HTMLElement>(
        `:scope > [${TABLE_CELL_CONTROL}][${TABLE_CELL_ACTIVE}]`,
      ) ?? block.querySelector<HTMLElement>(`:scope > [${TABLE_CELL_CONTROL}]`);
    if (cell) return cell;
  }
  if (isTextBlock(type)) {
    const editable = block.querySelector<HTMLElement>(
      `${EDITABLE_SELECTOR}[${BLOCK_SELECTION_SURFACE}]`,
    );
    if (editable) return editable;
  }
  return getSelectionButton(block);
}

function getBlockTargets(root: ParentNode) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(`.${EMAIL_BLOCK_CLASS_NAME}`),
  ).flatMap((block) => {
    const idx = getNodeIdxFromClassName(block.classList);
    const type = getNodeTypeFromClassName(block.classList);
    const element = type ? findTabTarget(block, type) : null;
    return idx && element ? [{ idx, element }] : [];
  });
}

export function syncBlockSelectionSurfaces({
  root,
  focusIdx,
  onSelect,
}: {
  root: HTMLElement;
  focusIdx: string;
  onSelect: (idx: string) => void;
}) {
  // Each editable is tabbable by default. Without this, Tab skips the blocks and stops in each text.
  root.querySelectorAll<HTMLElement>(EDITABLE_SELECTOR).forEach((editable) => {
    editable.tabIndex = -1;
  });

  root
    .querySelectorAll<HTMLElement>(
      `[${BLOCK_SELECTION_SURFACE}], [${TABLE_CELL_CONTROL}]`,
    )
    .forEach((element) => {
      element.tabIndex = -1;
    });

  root
    .querySelectorAll<HTMLElement>(`.${EMAIL_BLOCK_CLASS_NAME}`)
    .forEach((block) => {
      const idx = getNodeIdxFromClassName(block.classList);
      const type = getNodeTypeFromClassName(block.classList);
      if (!idx || !type) return;

      const surface = getTabTarget(block, idx, type);
      if (isSelectionButton(surface)) {
        surface.setAttribute("aria-pressed", String(idx === focusIdx));
        surface.onclick = () => onSelect(idx);
      }
      surface.onfocus = () => onSelect(idx);
    });

  const targets = getBlockTargets(root);
  const activeTarget =
    targets.find((target) => target.idx === focusIdx) ?? targets[0];
  if (activeTarget) activeTarget.element.tabIndex = 0;
}

/** Handles Tab and Enter for the whole canvas, so each element inside a block follows the same rules. */
export function handleCanvasKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const element = event.target as HTMLElement;

  if (
    event.key === "Enter" &&
    isSelectionButton(element) &&
    element.hasAttribute(BLOCK_SELECTION_SURFACE)
  ) {
    event.preventDefault();
    element.ownerDocument
      .querySelector<HTMLButtonElement>(
        "#easy-email-extensions-InteractivePrompt-Toolbar [role=toolbar] button",
      )
      ?.focus();
    return;
  }

  if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  const block = element.closest(`.${EMAIL_BLOCK_CLASS_NAME}`);
  const idx = block && getNodeIdxFromClassName(block.classList);
  if (idx && focusAdjacentBlock(element.ownerDocument, idx, event.shiftKey)) {
    event.preventDefault();
  }
}

export function focusBlockSelectionSurface(document: Document, idx: string) {
  const target = document.querySelector<HTMLElement>(
    `[${BLOCK_SELECTION_SURFACE}="${idx}"]`,
  );
  if (target) focusTarget(target);
}

/** Moves the focus from the block `idx` to the next or previous block. Returns false at either end. */
export function focusAdjacentBlock(
  document: Document,
  idx: string,
  backwards: boolean,
) {
  const targets = getBlockTargets(document);
  const index = targets.findIndex((target) => target.idx === idx);
  const next = targets[getNextBlockIndex(index, targets.length, backwards)];
  if (index < 0 || !next) return false;
  targets.forEach((target) => {
    target.element.tabIndex = target === next ? 0 : -1;
  });
  focusTarget(next.element);
  return true;
}

/** Returns false when no block can take the focus, for example on the Preview tab. */
export function focusActiveBlock(document: Document) {
  const active = getBlockTargets(document).find(
    (target) => target.element.tabIndex === 0,
  );
  if (!active) return false;
  focusTarget(active.element);
  return document.activeElement === active.element;
}
