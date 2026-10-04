import type { CSSProperties } from "react";

const GAP = 10;
/** The height of one row of tools. It applies until the toolbar measures itself. */
export const DEFAULT_TOOLBAR_HEIGHT = 35;

/** Places the text toolbar above the block, or below it when the block is too near the top of the canvas. */
export function getToolbarStyle(
  rect: Pick<DOMRect, "top" | "bottom">,
  toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
): CSSProperties {
  const above = rect.top - toolbarHeight - GAP;
  return {
    position: "fixed",
    top: above >= 0 ? above : rect.bottom + GAP,
    // With both sides at 0, the toolbar can use the full canvas width before the tools wrap.
    left: 0,
    right: 0,
    margin: "0 auto",
    width: "fit-content",
    maxWidth: "100%",
    padding: "4px 15px",
    boxSizing: "border-box",
    zIndex: 100,
  };
}
