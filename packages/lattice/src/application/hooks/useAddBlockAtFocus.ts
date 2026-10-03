import { useCallback } from "react";
import { useBlock, useEditorProps, useFocusIdx } from "@";
import { resolveAddTarget } from "@/shared/utils/panel/resolveAddTarget";
import { IBlockData } from "@/domain/typings";

/** Adds a block at the same place as the "+" button of the selected block. */
export function useAddBlockAtFocus() {
  const { values, addBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { autoComplete = false } = useEditorProps();

  const getTarget = useCallback(
    (type: string) =>
      resolveAddTarget({ type, focusIdx, values, autoComplete }),
    [autoComplete, focusIdx, values],
  );

  /** Returns false when the block has no valid place. */
  const addAtFocus = useCallback(
    (type: string, payload?: Partial<IBlockData>) => {
      const target = getTarget(type);
      if (!target) return false;
      addBlock({ type, payload, ...target });
      return true;
    },
    [addBlock, getTarget],
  );

  return { getTarget, addAtFocus };
}
