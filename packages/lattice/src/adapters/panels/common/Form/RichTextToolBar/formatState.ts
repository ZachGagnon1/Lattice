import { toHexColor } from "@/shared/utils/colorName";

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  fontFamily: string;
  /** The computed size, such as `16px`. */
  fontSize: string;
  /** A hex color, or an empty string when the text has no background. */
  color: string;
  backgroundColor: string;
}

export const EMPTY_FORMAT_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  fontFamily: "",
  fontSize: "",
  color: "",
  backgroundColor: "",
};

export function firstFontFamily(value: string | null | undefined) {
  const first = value?.split(",")[0]?.trim() ?? "";
  return first.replace(/^["']|["']$/g, "");
}

/** A highlight sits on an ancestor, so the computed style of the caret element is often transparent. */
export function findBackgroundColor(element: Element, editable: Element) {
  const view = element.ownerDocument.defaultView;
  let current: Element | null = element;
  while (current && view) {
    const color = toHexColor(view.getComputedStyle(current).backgroundColor);
    if (color) return color;
    if (current === editable) break;
    current = current.parentElement;
  }
  return "";
}

function queryState(document: Document, command: string) {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

/**
 * Reads the format at `range`.
 * `queryCommandState` also reports a pending caret format, such as bold on an empty caret.
 * The DOM holds no `<b>` for that format yet.
 */
export function readFormatState(range: Range, editable: Element): FormatState {
  const node = range.startContainer;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  const document = node.ownerDocument;
  const view = document?.defaultView;
  if (!element || !document || !view) return EMPTY_FORMAT_STATE;

  const style = view.getComputedStyle(element);
  return {
    bold: queryState(document, "bold"),
    italic: queryState(document, "italic"),
    underline: queryState(document, "underline"),
    strikeThrough: queryState(document, "strikeThrough"),
    fontFamily: firstFontFamily(style.fontFamily),
    fontSize: style.fontSize,
    color: toHexColor(style.color),
    backgroundColor: findBackgroundColor(element, editable),
  };
}
