export function isToolbarExitKey(key: string, currentIndex: number) {
  return currentIndex >= 0 && (key === "Escape" || key === "Tab");
}

export function getEditableFromRange(range: Range | null | undefined) {
  const node = range?.commonAncestorContainer;
  const element =
    node?.nodeType === 1
      ? (node as HTMLElement)
      : (node?.parentElement as HTMLElement | null | undefined);
  return element?.closest?.<HTMLElement>('[contenteditable="true"]') ?? null;
}
