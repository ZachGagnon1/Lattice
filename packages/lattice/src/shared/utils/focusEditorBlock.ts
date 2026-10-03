import { getBlockNodeByIdx } from "./getBlockNodeByIdx";

export function focusEditorBlock(idx: string, attempt = 0) {
  const block = getBlockNodeByIdx(idx);
  if (block instanceof HTMLElement) {
    if (!block.hasAttribute("tabindex")) block.tabIndex = -1;
    block.focus({ preventScroll: true });
    return;
  }
  if (attempt < 10) {
    window.setTimeout(() => focusEditorBlock(idx, attempt + 1), 50);
  }
}
