import { BlockManager } from "@/domain/blocks/BlockManager";
import {
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
} from "@/domain/blocks/block";
import { EMAIL_BLOCK_CLASS_NAME } from "@/domain/constants";

export const BLOCK_SELECTION_SURFACE = "data-block-selection-surface";
export const BLOCK_SELECTION_INSTRUCTIONS = "block-selection-instructions";

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

export function syncBlockSelectionSurfaces({
  root,
  focusIdx,
  onSelect,
}: {
  root: HTMLElement;
  focusIdx: string;
  onSelect: (idx: string) => void;
}) {
  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>(`.${EMAIL_BLOCK_CLASS_NAME}`),
  );
  const surfaces = blocks.flatMap((block) => {
    const idx = getNodeIdxFromClassName(block.classList);
    const type = getNodeTypeFromClassName(block.classList);
    if (!idx || !type) return [];

    let button = block.querySelector<HTMLButtonElement>(
      `:scope > [${BLOCK_SELECTION_SURFACE}]`,
    );
    if (!button) {
      button = block.ownerDocument.createElement("button");
      button.type = "button";
      button.setAttribute(BLOCK_SELECTION_SURFACE, idx);
      button.setAttribute("aria-describedby", BLOCK_SELECTION_INSTRUCTIONS);
      setVisuallyHiddenStyle(button);
      block.prepend(button);
    }
    const blockName = BlockManager.getBlockByType(type)?.name ?? type;
    const isSelected = idx === focusIdx;
    button.setAttribute(
      "aria-label",
      `${t("Select")} ${blockName} ${t("block")}`,
    );
    button.setAttribute("aria-pressed", String(isSelected));
    button.tabIndex = -1;
    button.onfocus = () => onSelect(idx);
    button.onclick = () => onSelect(idx);
    return [button];
  });

  const activeSurface =
    surfaces.find(
      (surface) => surface.getAttribute(BLOCK_SELECTION_SURFACE) === focusIdx,
    ) ?? surfaces[0];
  if (activeSurface) activeSurface.tabIndex = 0;

  surfaces.forEach((button, index) => {
    button.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        root.ownerDocument
          .querySelector<HTMLButtonElement>(
            "#easy-email-extensions-InteractivePrompt-Toolbar button",
          )
          ?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const targetIndex = getNextBlockIndex(
        index,
        surfaces.length,
        event.shiftKey,
      );
      if (targetIndex < 0) return;
      event.preventDefault();
      surfaces.forEach((surface, itemIndex) => {
        surface.tabIndex = itemIndex === targetIndex ? 0 : -1;
      });
      surfaces[targetIndex].focus();
    };
  });
}

export function focusBlockSelectionSurface(document: Document, idx: string) {
  document
    .querySelector<HTMLButtonElement>(`[${BLOCK_SELECTION_SURFACE}="${idx}"]`)
    ?.focus();
}
