/** Each column item holds several layouts. The palette shows them behind a toggle, so the add menu lists each one. */
export function getColumnLayouts(title: string | undefined, payload: unknown) {
  return ((payload ?? []) as string[][]).map((widths) => ({
    label: `${title ?? ""} (${widths.join(" / ")})`,
    widths,
  }));
}
