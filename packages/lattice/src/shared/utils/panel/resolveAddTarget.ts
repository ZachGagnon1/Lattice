import { get } from "lodash-es";
import {
  BlockManager,
  getParentIdx,
  getIndexByIdx,
} from "@/shared/utils/block";
import { IBlockData } from "@/domain/typings";
import { IEmailTemplate } from "@/shared/typings";

export interface AddTarget {
  parentIdx: string;
  positionIndex: number;
}

/**
 * Finds where the "+" button adds a block: inside the focused block, else after it.
 * With `autoComplete`, `addBlock` wraps the block in the parents that it is missing.
 */
export function resolveAddTarget(params: {
  type: string;
  focusIdx: string;
  values: IEmailTemplate;
  autoComplete: boolean;
}): AddTarget | null {
  const { type, focusIdx, values, autoComplete } = params;

  const focusBlock = get(values, focusIdx) as IBlockData | undefined;
  const block = BlockManager.getBlockByType(type);

  if (!focusBlock || !block) {
    return null;
  }

  const insideTarget: AddTarget = {
    parentIdx: focusIdx,
    positionIndex: focusBlock.children.length,
  };

  if (BlockManager.isValidParent(block, focusBlock.type)) {
    return insideTarget;
  }

  const parentIdx = getParentIdx(focusIdx);
  const parent = parentIdx
    ? (get(values, parentIdx) as IBlockData | undefined)
    : undefined;

  const sibling: AddTarget | null =
    parent && parentIdx
      ? { parentIdx, positionIndex: getIndexByIdx(focusIdx) + 1 }
      : null;

  if (sibling && parent && BlockManager.isValidParent(block, parent.type)) {
    return sibling;
  }

  if (autoComplete) {
    if (
      sibling &&
      parent &&
      BlockManager.getAutoCompletePath(type, parent.type) !== null
    ) {
      return sibling;
    }

    if (BlockManager.getAutoCompletePath(type, focusBlock.type) !== null) {
      return insideTarget;
    }
  }

  return null;
}
