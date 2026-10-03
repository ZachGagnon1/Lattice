import { get } from "lodash-es";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { getIndexByIdx, getParentIdx } from "@/domain/blocks/block";
import { IBlockData } from "@/domain/typings";
import { IEmailTemplate } from "@/shared/typings";

export type MovePlacement = "before" | "after" | "inside";

/**
 * Returns the `destinationIdx` that `moveBlock` takes, or null when the move is not valid.
 * `moveBlock` removes the block first, so a later sibling in the same parent moves one place back.
 */
export function resolveMoveTarget(params: {
  values: IEmailTemplate;
  sourceIdx: string;
  targetIdx: string;
  placement: MovePlacement;
}): string | null {
  const { values, sourceIdx, targetIdx, placement } = params;
  if (sourceIdx === targetIdx || targetIdx.startsWith(`${sourceIdx}.`)) {
    return null;
  }

  const source = get(values, sourceIdx) as IBlockData | undefined;
  const sourceParentIdx = getParentIdx(sourceIdx);
  const block = source && BlockManager.getBlockByType(source.type);
  if (!block || !sourceParentIdx) return null;

  const parentIdx =
    placement === "inside" ? targetIdx : getParentIdx(targetIdx);
  const parent =
    parentIdx && (get(values, parentIdx) as IBlockData | undefined);
  if (
    !parentIdx ||
    !parent ||
    !BlockManager.isValidParent(block, parent.type)
  ) {
    return null;
  }

  let position =
    placement === "inside"
      ? parent.children.length
      : getIndexByIdx(targetIdx) + (placement === "after" ? 1 : 0);
  const sourceIndex = getIndexByIdx(sourceIdx);
  if (parentIdx === sourceParentIdx) {
    if (sourceIndex < position) position -= 1;
    if (position === sourceIndex) return null;
  }
  return `${parentIdx}.children.[${position}]`;
}

/** Shifts `idx` back by one place where it passes through a later sibling of the removed block. */
export function getIdxAfterRemoval(idx: string, removedIdx: string) {
  const parentIdx = getParentIdx(removedIdx);
  const prefix = `${parentIdx}.children.[`;
  if (!parentIdx || !idx.startsWith(prefix)) return idx;
  const rest = idx.slice(prefix.length);
  const index = parseInt(rest, 10);
  if (Number.isNaN(index) || index <= getIndexByIdx(removedIdx)) return idx;
  return `${prefix}${index - 1}${rest.slice(String(index).length)}`;
}
