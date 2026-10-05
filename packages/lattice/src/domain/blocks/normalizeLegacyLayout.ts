import { BasicType } from "@/domain/constants";
import { IBlockData } from "@/domain/typings";
import { BlockManager } from "@/domain/blocks/BlockManager";
import type { IPage } from "@/domain/blocks/definitions/Page";

function needsWrap(child: IBlockData, parentType: string): boolean {
  const block = BlockManager.getBlockByType(child.type);
  return (
    !!block &&
    !BlockManager.isValidParent(block, parentType) &&
    BlockManager.isValidParent(block, BasicType.COLUMN)
  );
}

// Spread the children after create(), because create() deep-merges and clones them.
function wrapInSection(child: IBlockData): IBlockData {
  const column = BlockManager.getBlockByType(BasicType.COLUMN)!.create({});
  const section = BlockManager.getBlockByType(BasicType.SECTION)!.create({
    attributes: { padding: "0px" },
  });
  return {
    ...section,
    children: [{ ...column, children: [child] }],
  };
}

function normalizeChildren(
  children: IBlockData[],
  parentType: string,
): IBlockData[] {
  let changed = false;
  const next = children.map((child) => {
    if (needsWrap(child, parentType)) {
      changed = true;
      return wrapInSection(child);
    }
    if (BlockManager.toBasicType(child.type) !== BasicType.WRAPPER)
      return child;
    const inner = normalizeChildren(child.children, child.type);
    if (inner === child.children) return child;
    changed = true;
    return { ...child, children: inner };
  });
  return changed ? next : children;
}

/**
 * Wraps each content block that sits directly under the page or a page-level
 * wrapper in its own Section and Column, as old easy-email did.
 * Returns the same object when nothing changes. Does not mutate the input.
 */
export function normalizeLegacyLayout(page: IPage): IPage {
  const children = normalizeChildren(page.children, page.type);
  return children === page.children ? page : { ...page, children };
}
