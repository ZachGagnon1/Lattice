export const INLINE_EDIT_INSTRUCTIONS_ID = "lattice-inline-edit-instructions";

export type InlineEditKind = "text" | "button" | "navbar" | "table";

export function getInlineEditAttributes(
  kind: InlineEditKind,
  position?: { row: number; column: number },
) {
  const labels: Record<InlineEditKind, string> = {
    text: "Text block content",
    button: "Button text",
    navbar: "Navigation links",
    table: position
      ? `Table cell, row ${position.row + 1}, column ${position.column + 1}`
      : "Table cell content",
  };

  return {
    role: "textbox",
    "aria-label": labels[kind],
    "aria-multiline": kind === "text" || kind === "table" ? "true" : "false",
    "aria-describedby": INLINE_EDIT_INSTRUCTIONS_ID,
  };
}
