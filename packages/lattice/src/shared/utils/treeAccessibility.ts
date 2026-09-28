export function getTreeItemAccessibility({
  depth,
  hasChildren,
  isExpanded,
  isSelected,
  isActive,
}: {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isActive: boolean;
}) {
  return {
    role: "treeitem" as const,
    "aria-level": depth + 1,
    "aria-expanded": hasChildren ? isExpanded : undefined,
    "aria-selected": isSelected,
    tabIndex: isActive ? 0 : -1,
  };
}
