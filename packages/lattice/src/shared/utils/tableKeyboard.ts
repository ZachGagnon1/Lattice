export function getTableCellTarget(
  row: number,
  column: number,
  key: string,
  columnCounts: number[],
) {
  let nextRow = row;
  let nextColumn = column;
  if (key === "ArrowUp") nextRow -= 1;
  if (key === "ArrowDown") nextRow += 1;
  if (key === "ArrowLeft") nextColumn -= 1;
  if (key === "ArrowRight") nextColumn += 1;
  if (nextRow < 0 || nextRow >= columnCounts.length) return null;
  if (nextColumn < 0 || nextColumn >= columnCounts[nextRow]) return null;
  return { row: nextRow, column: nextColumn };
}

export function isTableSourceCellPath(path: string | null) {
  return Boolean(path?.includes(".data.value.tableSource."));
}

export function getTableBlockPath(path: string | null) {
  const marker = ".data.value.tableSource.";
  const markerIndex = path?.indexOf(marker) ?? -1;
  return markerIndex >= 0 ? path!.slice(0, markerIndex) : null;
}

/** True for a key that types a character, so the cell can start the edit with it. */
export function isTypingKey(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}) {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}
