export function getActiveIndexAfterRemoval(
  activeIndex: number,
  removedIndex: number,
  itemCount: number,
): number {
  const nextCount = Math.max(0, itemCount - 1);
  if (nextCount === 0) return 0;
  if (removedIndex < activeIndex) return activeIndex - 1;
  if (removedIndex === activeIndex) return Math.min(activeIndex, nextCount - 1);
  return activeIndex;
}

export function getRepeatItemLabel(label: string | undefined, index: number) {
  return `${label || "Item"} ${index + 1}`;
}
