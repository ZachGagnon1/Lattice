import { useInsertionEffect } from "react";
import tokens from "../theme/tokens.scss?inline";
import text from "../Text/text.scss?inline";

/** Every kit stylesheet. A new kit component adds its file here. */
export const KIT_CSS = [tokens, text].join("\n");

const STYLE_ATTRIBUTE = "data-lattice-kit";

/**
 * Adds the kit CSS to a document once. The library ships no CSS file, and the
 * canvas frame is its own document. The tag goes first, so host CSS wins.
 */
export function ensureKitStyles(doc: Document, css: string = KIT_CSS) {
  if (doc.head.querySelector(`style[${STYLE_ATTRIBUTE}]`)) return;
  const style = doc.createElement("style");
  style.setAttribute(STYLE_ATTRIBUTE, "");
  style.textContent = css;
  doc.head.prepend(style);
}

export function useKitStyles(doc: Document | null | undefined) {
  useInsertionEffect(() => {
    if (doc) ensureKitStyles(doc);
  }, [doc]);
}
