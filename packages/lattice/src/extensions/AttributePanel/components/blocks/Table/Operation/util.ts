import { DATA_CONTENT_EDITABLE_IDX } from "@";
import { ITableCellData } from "@/core/blocks";
import { IBoundaryRect, IBoundingPosition, IOperationData } from "./type";

const getEditorElementClientRect = (target: any) => {
  let left = target.offsetLeft;
  let top = target.offsetTop;
  const width = target.clientWidth;
  const height = target.clientHeight;
  let parentNode = target.offsetParent;
  while (parentNode && parentNode.offsetParent) {
    if (parentNode.classList.contains("shadow-container")) {
      return { left, top, height, width };
    }
    left += parentNode.offsetLeft;
    top += parentNode.offsetTop;
    parentNode = parentNode.offsetParent;
  }
  return { left, top, height, width };
};

const getBoundaryFromRects = (startRect: any, endRect: any) => {
  const left = Math.min(
    startRect.left,
    endRect.left,
    startRect.left + startRect.width,
    endRect.left + endRect.width,
  );
  const right = Math.max(
    startRect.left,
    endRect.left,
    startRect.left + startRect.width,
    endRect.left + endRect.width,
  );
  const top = Math.min(
    startRect.top,
    endRect.top,
    startRect.top + startRect.height,
    endRect.top + endRect.height,
  );
  const bottom = Math.max(
    startRect.top,
    endRect.top,
    startRect.top + startRect.height,
    endRect.top + endRect.height,
  );
  return {
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
  };
};

const ERROR_LIMIT = 2;

const getCorrectBoundary = (el: Element, currentBoundary: IBoundaryRect) => {
  const tableEl = el.parentElement?.parentElement?.parentElement;
  if (!tableEl) return null;

  let leftTopCell = el;
  let bottomRightCell = el;
  let leftTopRect = getEditorElementClientRect(el);
  let bottomRightRect = leftTopRect;

  const tableCells = tableEl.querySelectorAll("td");
  const tableCellRects: any[] = [];
  tableCells.forEach((tableCell) => {
    const { left, top, height, width } = getEditorElementClientRect(tableCell);
    tableCellRects.push({ left, top, height, width });
    const isIntersected =
      ((left + ERROR_LIMIT >= currentBoundary.left &&
        left + ERROR_LIMIT <= currentBoundary.right) ||
        (left - ERROR_LIMIT + width >= currentBoundary.left &&
          left - ERROR_LIMIT + width <= currentBoundary.right)) &&
      ((top + ERROR_LIMIT >= currentBoundary.top &&
        top + ERROR_LIMIT <= currentBoundary.bottom) ||
        (top - ERROR_LIMIT + height >= currentBoundary.top &&
          top - ERROR_LIMIT + height <= currentBoundary.bottom));
    if (isIntersected) {
      currentBoundary = getBoundaryFromRects(currentBoundary, {
        left,
        top,
        height,
        width,
      });
    }
  });

  tableCells.forEach((tableCell, index) => {
    const { left, top, height, width } = tableCellRects[index];
    const isIntersected =
      ((left + ERROR_LIMIT >= currentBoundary.left &&
        left + ERROR_LIMIT <= currentBoundary.right) ||
        (left - ERROR_LIMIT + width >= currentBoundary.left &&
          left - ERROR_LIMIT + width <= currentBoundary.right)) &&
      ((top + ERROR_LIMIT >= currentBoundary.top &&
        top + ERROR_LIMIT <= currentBoundary.bottom) ||
        (top - ERROR_LIMIT + height >= currentBoundary.top &&
          top - ERROR_LIMIT + height <= currentBoundary.bottom));
    if (!isIntersected) return;

    if (top <= leftTopRect.top && left <= leftTopRect.left) {
      leftTopRect = tableCellRects[index];
      leftTopCell = tableCell;
    }
    if (
      top === leftTopRect.top + ERROR_LIMIT ||
      (top === leftTopRect.top && left <= leftTopRect.left)
    ) {
      leftTopRect = tableCellRects[index];
      leftTopCell = tableCell;
    }
    if (
      top + height >
        bottomRightRect.top + bottomRightRect.height + ERROR_LIMIT ||
      (top + height === bottomRightRect.top + bottomRightRect.height &&
        left + width >= bottomRightRect.left + bottomRightRect.width)
    ) {
      bottomRightRect = tableCellRects[index];
      bottomRightCell = tableCell;
    }
  });

  return { leftTopCell, bottomRightCell, boundary: currentBoundary };
};

export const getBoundaryRectAndElement = (el1: Element, el2: Element) => {
  const rect1 = getEditorElementClientRect(el1);
  const rect2 = getEditorElementClientRect(el2);
  const boundary = getBoundaryFromRects(rect1, rect2);
  return getCorrectBoundary(el1, boundary);
};

export function setStyle(domNode: any, rules: any) {
  if (typeof rules === "object") {
    for (const prop in rules) {
      domNode.style[prop] = rules[prop];
    }
  }
}

export const getCurrentTable = (target: Element) => {
  let parentNode = target.parentNode;
  while (parentNode) {
    if (parentNode.nodeName === "TABLE") return parentNode;
    parentNode = parentNode.parentNode;
  }
  return parentNode;
};

export const getElementsBoundary = (
  el1: Element,
  el2: Element,
): IBoundingPosition => {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return {
    left: Math.min(rect1.left, rect2.left),
    top: Math.min(rect1.top, rect2.top),
    right: Math.max(rect1.right, rect2.right),
    bottom: Math.max(rect1.bottom, rect2.bottom),
  };
};

export const checkEventInBoundingRect = (
  rect: IBoundingPosition,
  { x, y }: { x: number; y: number },
) => x >= rect.left && x <= rect.right && y <= rect.bottom && y >= rect.top;

const CELL_INDEX_PATTERN = /data\.value\.tableSource\.(\d+)\.(\d+)\.content$/;

const getCellIndex = (cellElement: Element): [number, number] | null => {
  const match = cellElement
    .getAttribute(DATA_CONTENT_EDITABLE_IDX)
    ?.match(CELL_INDEX_PATTERN);
  return match ? [Number(match[1]), Number(match[2])] : null;
};

// Returns null when a cell is not a table source cell, for example a td from nested HTML.
export const getTdBoundaryIndex = (
  leftTopCell: Element,
  bottomRightCell: Element,
): IBoundingPosition | null => {
  const idx1 = getCellIndex(leftTopCell);
  const idx2 = getCellIndex(bottomRightCell);
  if (!idx1 || !idx2) return null;
  return { top: idx1[0], left: idx1[1], right: idx2[1], bottom: idx2[0] };
};

export const getCorrectTableIndexBoundary = (
  tableIndexBoundary: IBoundingPosition,
  tableData: IOperationData[][],
) => {
  let { left, right, top, bottom } = tableIndexBoundary;

  tableData.forEach((tr, trIndex) => {
    tr.forEach((td) => {
      td.top = trIndex;
      td.bottom = trIndex + (td.rowSpan || 1) - 1;
    });
  });

  const maxTdCount = getMaxTdCount(tableData);
  const mergedCells: [number, number][] = [];
  Array.from({ length: maxTdCount }).forEach((_, tdIndex) => {
    tableData.forEach((tr, trIndex) => {
      const mergedCell = mergedCells.find(
        (e) => e[0] === trIndex && e[1] === tdIndex,
      );
      if (mergedCell) return;
      const mergedTds = mergedCells.filter(
        (e) => e[0] === trIndex && e[1] < tdIndex,
      );
      const _tdIndex = tdIndex - mergedTds.length;
      const td = tr[_tdIndex];
      if (!td) return;
      const rowSpan = td.rowSpan || 1;
      const colSpan = td.colSpan || 1;
      td.left = tdIndex;
      td.right = tdIndex + colSpan - 1;

      if (rowSpan > 1 || colSpan > 1) {
        Array.from({ length: rowSpan }).forEach((_, rowSpanIndex) => {
          Array.from({ length: colSpan }).forEach((_, colSpanIndex) => {
            if (rowSpanIndex === 0 && colSpanIndex === 0) return;
            mergedCells.push([trIndex + rowSpanIndex, tdIndex + colSpanIndex]);
          });
        });
      }
    });
  });

  tableIndexBoundary.left = tableData?.[top]?.[left]?.left || 0;
  tableIndexBoundary.right = tableData?.[bottom]?.[right]?.right || 0;
  tableIndexBoundary.bottom = tableData?.[bottom]?.[right]?.bottom || 0;
  tableIndexBoundary.top = tableData?.[top]?.[left]?.top || 0;

  return tableIndexBoundary;
};

export const getMaxTdCount = (tableData: ITableCellData[][]) => {
  let tdCount = 1;
  tableData.forEach((tr) => {
    const _tdCount = tr.reduce((count, td) => count + (td.colSpan || 1), 0);
    if (_tdCount > tdCount) tdCount = _tdCount;
  });
  return tdCount;
};
