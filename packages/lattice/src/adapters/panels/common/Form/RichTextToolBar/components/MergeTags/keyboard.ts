export function moveMergeTagFocus(
  container: HTMLElement,
  target: EventTarget | null,
  key: string,
) {
  if (key !== "ArrowDown" && key !== "ArrowUp") return false;

  const items = Array.from(
    container.querySelectorAll<HTMLElement>(
      '[role="treeitem"]:not([aria-disabled="true"])',
    ),
  );
  const currentItem = (target as HTMLElement | null)?.closest?.(
    '[role="treeitem"]',
  );
  const currentIndex = currentItem
    ? items.indexOf(currentItem as HTMLElement)
    : -1;
  if (currentIndex < 0) return false;

  const offset = key === "ArrowDown" ? 1 : -1;
  const nextIndex = Math.max(
    0,
    Math.min(items.length - 1, currentIndex + offset),
  );
  items[nextIndex]?.focus();
  return true;
}
