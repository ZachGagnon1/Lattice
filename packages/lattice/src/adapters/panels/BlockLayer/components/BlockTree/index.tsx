import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Box, IconButton } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

// --- Types ---
interface TreeNode<T> {
  id: string;
  children?: T[];
}

export interface BlockTreeProps<T extends TreeNode<T>> {
  treeData: T[];
  selectedKeys?: string[];
  expandedKeys?: string[];
  onSelect: (selectedId: string) => void;
  onContextMenu?: (nodeData: T, ev: React.MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMouseLeave?: () => void;
  onMouseEnter?: (id: string) => void;
  renderTitle: (data: T) => React.ReactNode;
  defaultExpandAll?: boolean;

  allowDrop?: (o: any) => boolean | { key: string; position: number };
  onDrop: (o: {
    dragNode: { dataRef: T; parent: T | null; key: string; parentKey: string };
    dropNode: { dataRef: T; parent: T | null; key: string; parentKey: string };
    dropPosition: number;
  }) => void;
}

interface FlattenedItem<T> {
  id: string;
  item: T;
  depth: number;
  parent: T | null;
  parentKey: string;
  isExpanded: boolean;
  hasChildren: boolean;
}

// --- Flatten Tree Helper ---
function flattenTree<T extends TreeNode<T>>(
  items: T[],
  expandedKeys: string[],
  depth = 0,
  parent: T | null = null,
): FlattenedItem<T>[] {
  return items.reduce<FlattenedItem<T>[]>((acc, item) => {
    const isExpanded = expandedKeys.includes(item.id);
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;

    const flattenedNode: FlattenedItem<T> = {
      id: item.id,
      item,
      depth,
      parent,
      parentKey: parent?.id || "",
      isExpanded,
      hasChildren,
    };

    acc.push(flattenedNode);

    if (isExpanded && hasChildren) {
      acc.push(...flattenTree(item.children!, expandedKeys, depth + 1, item));
    }

    return acc;
  }, []);
}

// --- Polished Sortable Item Component ---
const SortableTreeItem = <T extends TreeNode<T>>({
  node,
  index,
  selectedKeys,
  onSelect,
  onToggleExpand,
  onContextMenu,
  onMouseEnter,
  renderTitle,
}: {
  node: FlattenedItem<T>;
  index: number;
  selectedKeys: string[];
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onContextMenu?: (data: T, e: React.MouseEvent) => void;
  onMouseEnter?: (id: string) => void;
  renderTitle: (data: T) => React.ReactNode;
}) => {
  // Prevent dragging the root page block
  const isPageBlock = (node.item as any).type === "page" || node.depth === 0;

  const { ref, handleRef, isDragging } = useSortable({
    id: node.id,
    index,
    disabled: isPageBlock,
  });

  const isSelected = selectedKeys.includes(node.id);

  return (
    <Box
      ref={ref}
      onMouseEnter={() => onMouseEnter?.(node.id)}
      onContextMenu={(e) => onContextMenu?.(node.item, e)}
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: "32px",
        mx: 1,
        my: "2px",
        pr: 1,
        pl: `${node.depth * 16 + 8}px`, // Strict indentation
        borderRadius: 1,
        cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isSelected ? "primary.50" : "transparent",
        color: isSelected ? "primary.main" : "text.primary",
        "&:hover": {
          backgroundColor: isSelected ? "primary.100" : "action.hover",
          "& .drag-handle": { opacity: 1 },
        },
        transition: "background-color 0.2s ease-in-out",
      }}
      onClick={() => onSelect(node.id)}
    >
      {/* Expand / Collapse Chevron */}
      <Box
        sx={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mr: 0.5,
        }}
      >
        {node.hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            sx={{ p: 0, color: isSelected ? "primary.main" : "text.secondary" }}
          >
            {node.isExpanded ? (
              <ExpandMoreIcon sx={{ fontSize: 18 }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        ) : null}
      </Box>

      {/* Title / Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          whiteSpace: "nowrap",
          fontSize: "13px",
          "& > div": { display: "flex", alignItems: "center", gap: "8px" },
        }}
      >
        {renderTitle(node.item)}
      </Box>

      {/* Drag Handle (Hidden on Page blocks!) */}
      {!isPageBlock && (
        <Box
          className="drag-handle"
          ref={handleRef}
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "grab",
            color: "text.disabled",
            opacity: isSelected ? 1 : 0,
            transition: "opacity 0.2s",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 16 }} />
        </Box>
      )}
    </Box>
  );
};

// --- Main Tree Component ---
export function BlockTree<T extends TreeNode<T>>(props: BlockTreeProps<T>) {
  const {
    treeData,
    selectedKeys = [],
    onSelect,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onMouseLeave,
    onMouseEnter,
    renderTitle,
    onDrop,
  } = props;

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (props.defaultExpandAll) {
      const keys: string[] = [];
      const loop = (data: T) => {
        keys.push(data.id);
        data.children?.forEach(loop);
      };
      treeData.forEach(loop);
      setExpandedKeys(keys);
    }
  }, [props.defaultExpandAll, treeData]);

  useEffect(() => {
    if (props.expandedKeys) {
      setExpandedKeys((keys) =>
        Array.from(new Set([...keys, ...props.expandedKeys!])),
      );
    }
  }, [props.expandedKeys]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id],
    );
  }, []);

  const flattenedItems = useMemo(
    () => flattenTree(treeData, expandedKeys),
    [treeData, expandedKeys],
  );

  // THE FIX: Use a ref so the dnd-kit callbacks always have the absolute latest tree data,
  // preventing the "only works once" stale closure bug!
  const latestItemsRef = useRef(flattenedItems);
  useEffect(() => {
    latestItemsRef.current = flattenedItems;
  }, [flattenedItems]);

  const handleDragStart = (event: any) => {
    // Determine the ID of the dragged item
    const dragId = event?.active?.id || event?.operation?.source?.id;

    // Instantly collapse the node so it picks up all its children visually!
    if (dragId) {
      setExpandedKeys((prev) => prev.filter((k) => k !== dragId));
    }
    onDragStart?.();
  };

  const handleDragEnd = (event: any) => {
    onDragEnd?.();
    if (event?.canceled) return;

    // Standardize IDs across different @dnd-kit/react event payloads
    const dragId = event?.active?.id || event?.operation?.source?.id;
    const dropId = event?.over?.id || event?.operation?.target?.id;

    if (!dragId || !dropId || dragId === dropId) return;

    // Use the Ref to look up the exact items, making us immune to index shifting!
    const items = latestItemsRef.current;
    const dragIndex = items.findIndex((n) => n.id === dragId);
    const dropIndex = items.findIndex((n) => n.id === dropId);

    if (dragIndex === -1 || dropIndex === -1) return;

    const dragNode = items[dragIndex];
    const dropNode = items[dropIndex];

    const dragType = (dragNode.item as any).type || "";
    const dropType = (dropNode.item as any).type || "";

    // Default to dropping as a sibling
    let dropPosition = dropIndex > dragIndex ? 1 : -1;

    const isPage = dropType === "page";
    const isWrapper = dropType.includes("wrapper");
    const isSection = dropType.includes("section");
    const isColumn = dropType.includes("column");
    const isGroup = dropType.includes("group");
    const isHero = dropType.includes("hero");

    const isDragWrapper = dragType.includes("wrapper");
    const isDragSection = dragType.includes("section");
    const isDragColumn = dragType.includes("column");

    // Smart Schema Validation: Force internal drop (0) if the container naturally accepts the dragged element
    if (
      (isPage && isDragWrapper) ||
      (isWrapper && isDragSection) ||
      (isSection &&
        (isDragColumn || dragType === "group" || dragType === "hero")) ||
      (isColumn &&
        !isDragSection &&
        !isDragWrapper &&
        !isDragColumn &&
        dragType !== "page" &&
        dragType !== "hero") ||
      (isGroup &&
        !isDragSection &&
        !isDragWrapper &&
        !isDragColumn &&
        dragType !== "page") ||
      (isHero &&
        !isDragSection &&
        !isDragWrapper &&
        !isDragColumn &&
        dragType !== "page") ||
      isPage // You can't put anything "next" to a page, only inside it!
    ) {
      dropPosition = 0;
    }

    onDrop({
      dragNode: {
        dataRef: dragNode.item,
        parent: dragNode.parent,
        key: dragNode.id,
        parentKey: dragNode.parentKey,
      },
      dropNode: {
        dataRef: dropNode.item,
        parent: dropNode.parent,
        key: dropNode.id,
        parentKey: dropNode.parentKey,
      },
      dropPosition,
    });
  };

  return (
    <Box
      onMouseLeave={onMouseLeave}
      sx={{ width: "100%", userSelect: "none", py: 1 }}
    >
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {flattenedItems.map((node, index) => (
          <SortableTreeItem
            key={node.id}
            node={node}
            index={index}
            selectedKeys={selectedKeys}
            onSelect={onSelect}
            onToggleExpand={handleToggleExpand}
            onContextMenu={onContextMenu}
            onMouseEnter={onMouseEnter}
            renderTitle={renderTitle}
          />
        ))}
      </DragDropProvider>
    </Box>
  );
}
