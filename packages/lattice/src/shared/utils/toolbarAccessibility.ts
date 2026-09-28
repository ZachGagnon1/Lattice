export function getToolbarTargetIndex(
  currentIndex: number,
  itemCount: number,
  key: string,
) {
  if (itemCount === 0) return -1;
  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;
  if (key === "ArrowRight") return (currentIndex + 1) % itemCount;
  if (key === "ArrowLeft") return (currentIndex - 1 + itemCount) % itemCount;
  return currentIndex;
}
