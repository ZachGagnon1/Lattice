/** The CSS generic families. Each one works as the last fallback in any email client. */
export const GENERIC_FONT_FAMILIES = [
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "system-ui",
] as const;

/** Splits a CSS `font-family` value into its family names, in order. */
export function parseFontStack(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Joins family names into a CSS `font-family` value. The first copy of a name wins. */
export function joinFontStack(fonts: readonly string[]): string {
  return [...new Set(fonts.map((font) => font.trim()).filter(Boolean))].join(
    ", ",
  );
}

/** Lists each family name in the given `font-family` values once, then the generic families. */
export function fontStackOptions(values: readonly string[]): string[] {
  return [
    ...new Set([...values.flatMap(parseFontStack), ...GENERIC_FONT_FAMILIES]),
  ];
}
