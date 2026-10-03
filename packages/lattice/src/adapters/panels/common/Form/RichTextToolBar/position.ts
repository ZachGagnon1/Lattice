import type { CSSProperties } from "react";

const TOOLBAR_OFFSET = 45;

/** Places the text toolbar above the block, or below it when the block is near the top of the canvas. */
export function getToolbarStyle(
  rect: Pick<DOMRect, "top" | "bottom">,
): CSSProperties {
  return {
    position: "fixed",
    top:
      rect.top >= TOOLBAR_OFFSET ? rect.top - TOOLBAR_OFFSET : rect.bottom + 10,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "4px 15px",
    boxSizing: "border-box",
    zIndex: 100,
    whiteSpace: "nowrap",
    // A fixed element measures 100% against the iframe, so the inner toolbar scrolls and the canvas does not cut it off.
    maxWidth: "100%",
  };
}
