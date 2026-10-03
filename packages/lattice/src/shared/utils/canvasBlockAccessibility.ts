import { BlockManager } from "@/domain/blocks/BlockManager";
import {
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
} from "@/domain/blocks/block";
import { EMAIL_BLOCK_CLASS_NAME } from "@/domain/constants";
import { isTextBlock } from "./isTextBlock";

export const BLOCK_SELECTION_SURFACE = "data-block-selection-surface";
export const BLOCK_SELECTION_INSTRUCTIONS = "block-selection-instructions";
export const BLOCK_KEYBOARD_HINT_CLASS = "block-keyboard-hint";
export const TOOLBAR_KEYBOARD_HINT_CLASS = "block-toolbar-keyboard-hint";

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
      return editable;
    }
  }

  let button = getSelectionButton(block);
  if (!button) {
    button = block.ownerDocument.createElement("button");
    button.type = "button";
    button.setAttribute(BLOCK_SELECTION_SURFACE, idx);
    button.setAttribute("aria-describedby", BLOCK_SELECTION_INSTRUCTIONS);
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

function placeCaretAtEnd(editable: HTMLElement) {
  const selection = editable.ownerDocument.getSelection();
  if (!selection) return;
  const range = editable.ownerDocument.createRange();
  range.selectNodeContents(editable);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function focusTarget(target: HTMLElement) {
  target.focus();
  if (target.isContentEditable) placeCaretAtEnd(target);
}

function getTabTargets(document: Document) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[${BLOCK_SELECTION_SURFACE}]`),
  );
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

  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>(`.${EMAIL_BLOCK_CLASS_NAME}`),
  );
  const targets = blocks.flatMap((block) => {
    const idx = getNodeIdxFromClassName(block.classList);
    const type = getNodeTypeFromClassName(block.classList);
    if (!idx || !type) return [];

    const target = getTabTarget(block, idx, type);
    if (isSelectionButton(target)) {
      target.setAttribute("aria-pressed", String(idx === focusIdx));
      target.onclick = () => onSelect(idx);
    }
    target.tabIndex = -1;
    target.onfocus = () => onSelect(idx);
    return [target];
  });

  const activeTarget =
    targets.find(
      (target) => target.getAttribute(BLOCK_SELECTION_SURFACE) === focusIdx,
    ) ?? targets[0];
  if (activeTarget) activeTarget.tabIndex = 0;

  targets.forEach((target, index) => {
    target.onkeydown = (event) => {
      if (event.key === "Enter" && isSelectionButton(target)) {
        event.preventDefault();
        root.ownerDocument
          .querySelector<HTMLButtonElement>(
            "#easy-email-extensions-InteractivePrompt-Toolbar [role=toolbar] button",
          )
          ?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const targetIndex = getNextBlockIndex(
        index,
        targets.length,
        event.shiftKey,
      );
      if (targetIndex < 0) return;
      event.preventDefault();
      targets.forEach((item, itemIndex) => {
        item.tabIndex = itemIndex === targetIndex ? 0 : -1;
      });
      focusTarget(targets[targetIndex]);
    };
  });
}

export function focusBlockSelectionSurface(document: Document, idx: string) {
  const target = getTabTargets(document).find(
    (item) => item.getAttribute(BLOCK_SELECTION_SURFACE) === idx,
  );
  if (target) focusTarget(target);
}

/** Moves the focus from the block `idx` to the next block. Returns false at the last block. */
export function focusNextBlock(document: Document, idx: string) {
  const targets = getTabTargets(document);
  const index = targets.findIndex(
    (item) => item.getAttribute(BLOCK_SELECTION_SURFACE) === idx,
  );
  const next = targets[getNextBlockIndex(index, targets.length, false)];
  if (index < 0 || !next) return false;
  focusTarget(next);
  return true;
}
