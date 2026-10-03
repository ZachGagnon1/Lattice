import { isString } from "lodash-es";
import { RICH_TEXT_BAR_ID } from "@/constants";

export function getContentEditableType(type: string) {
  return `node-contenteditable-type-${type}`;
}

export function getContentEditableTypeFromClassName(
  classList: DOMTokenList | string,
) {
  const arr = Array.from(
    isString(classList) ? classList.split(" ") : classList,
  );
  return (
    arr
      .find((item) => item.includes("node-contenteditable-type-"))
      ?.replace("node-contenteditable-type-", "") || ""
  );
}

export function getContentEditableIdx(idx: string) {
  return `node-contenteditable-idx-${idx}`;
}

export function getContentEditableIdxFromClassName(
  classList: DOMTokenList | string,
) {
  const arr = Array.from(
    isString(classList) ? classList.split(" ") : classList,
  );
  return (
    arr
      .find((item) => item.includes("node-contenteditable-idx-"))
      ?.replace("node-contenteditable-idx-", "") || ""
  );
}

/**
 * Returns true while the user edits text: in the text, in the text toolbar, or in a toolbar popover.
 * The toolbar counts, because a keyboard user moves to it and back while the text block must stay in place.
 */
export function isEditingText(document: Document | null | undefined) {
  const activeElement = document?.activeElement;
  if (!activeElement) return false;
  return (
    activeElement.getAttribute("contenteditable") === "true" ||
    Boolean(
      document.getElementById(RICH_TEXT_BAR_ID)?.contains(activeElement),
    ) ||
    Boolean(activeElement.closest("[data-rich-text-toolbar-popup]"))
  );
}
