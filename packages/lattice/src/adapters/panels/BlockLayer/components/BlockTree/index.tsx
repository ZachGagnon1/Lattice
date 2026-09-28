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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getTreeItemAccessibility } from "@/shared/utils/treeAccessibility";

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
  onContextMenu?: (
    nodeData: T,
    position: { left: number; top: number },
  ) => void;
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

export function flattenTree<T extends TreeNode<T>>(
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
  activeId,
  onActiveIdChange,
}: {
  node: FlattenedItem<T>;
  index: number;
  selectedKeys: string[];
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onContextMenu?: (data: T, position: { left: number; top: number }) => void;
  onMouseEnter?: (id: string) => void;
  renderTitle: (data: T) => React.ReactNode;
  activeId: string;
  onActiveIdChange: (id: string) => void;
}) => {
  const isPageBlock = (node.item as any).type === "page" || node.depth === 0;

  const { ref, handleRef, isDragging } = useSortable({
    id: node.id,
    index,
    disabled: isPageBlock,
  });

  const isSelected = selectedKeys.includes(node.id);
  const accessibilityProps = getTreeItemAccessibility({
    depth: node.depth,
    hasChildren: node.hasChildren,
    isExpanded: node.isExpanded,
    isSelected,
    isActive: activeId === node.id,
  });

  const openContextMenu = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    onContextMenu?.(node.item, {
      left: rect.left + Math.min(rect.width, 32),
      top: rect.top + Math.min(rect.height, 32),
    });
  };

  return (
    <Box
      ref={ref}
      {...accessibilityProps}
      data-treeitem-id={node.id}
      onMouseEnter={() => onMouseEnter?.(node.id)}
      onFocus={() => onActiveIdChange(node.id)}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu?.(node.item, {
          left: event.clientX,
          top: event.clientY,
        });
      }}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) return;

        const tree = event.currentTarget.closest('[role="tree"]');
        const items = Array.from(
          tree?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [],
        );
        const currentIndex = items.indexOf(event.currentTarget);
        let target: HTMLElement | undefined;

        if (event.key === "ArrowDown") target = items[currentIndex + 1];
        if (event.key === "ArrowUp") target = items[currentIndex - 1];
        if (event.key === "Home") target = items[0];
        if (event.key === "End") target = items.at(-1);
        if (event.key === "ArrowRight") {
          if (node.hasChildren && !node.isExpanded) {
            onToggleExpand(node.id);
          } else if (node.hasChildren) {
            target = items[currentIndex + 1];
          }
        }
        if (event.key === "ArrowLeft") {
          if (node.hasChildren && node.isExpanded) {
            onToggleExpand(node.id);
          } else {
            target = items
              .slice(0, currentIndex)
              .reverse()
              .find(
                (item) =>
                  Number(item.getAttribute("aria-level")) === node.depth,
              );
          }
        }
        if (event.key === "Enter" || event.key === " ") {
          onSelect(node.id);
        }
        if (event.key === "F10" && event.shiftKey) {
          openContextMenu(event.currentTarget);
        }

        if (
          target ||
          [
            "ArrowDown",
            "ArrowUp",
            "ArrowRight",
            "ArrowLeft",
            "Home",
            "End",
            "Enter",
            " ",
          ].includes(event.key) ||
          (event.key === "F10" && event.shiftKey)
        ) {
          event.preventDefault();
        }
        target?.focus();
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: "32px",
        mx: 1,
        my: "2px",
        pr: 1,
        pl: `${node.depth * 16 + 8}px`,
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
            aria-label={`${node.isExpanded ? t("Collapse") : t("Expand")} ${t("block")}`}
            aria-expanded={node.isExpanded}
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

      {isSelected && (
        <CheckCircleIcon
          aria-label={t("Selected block")}
          color="primary"
          sx={{ fontSize: 16, ml: 0.5 }}
        />
      )}

      {!isPageBlock && (
        <IconButton
          aria-label={t("Move block")}
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
          <DragIndicatorIcon sx={{ fontSize: 16 }} aria-hidden="true" />
        </IconButton>
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
  const [activeId, setActiveId] = useState("");

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

  useEffect(() => {
    const visibleIds = flattenedItems.map((item) => item.id);
    if (!visibleIds.includes(activeId)) {
      setActiveId(
        selectedKeys.find((key) => visibleIds.includes(key)) ??
          visibleIds[0] ??
          "",
      );
    }
  }, [activeId, flattenedItems, selectedKeys]);

  const latestItemsRef = useRef(flattenedItems);
  useEffect(() => {
    latestItemsRef.current = flattenedItems;
  }, [flattenedItems]);

  const handleDragStart = (event: any) => {
    const dragId = event?.active?.id || event?.operation?.source?.id;

    if (dragId) {
      setExpandedKeys((prev) => prev.filter((k) => k !== dragId));
    }
    onDragStart?.();
  };

  const handleDragEnd = (event: any) => {
    onDragEnd?.();
    if (event?.canceled) return;

    const dragId = event?.active?.id || event?.operation?.source?.id;
    const dropId = event?.over?.id || event?.operation?.target?.id;

    if (!dragId || !dropId || dragId === dropId) return;

    const items = latestItemsRef.current;
    const dragIndex = items.findIndex((n) => n.id === dragId);
    const dropIndex = items.findIndex((n) => n.id === dropId);

    if (dragIndex === -1 || dropIndex === -1) return;

    const dragNode = items[dragIndex];
    const dropNode = items[dropIndex];

    const dragType = (dragNode.item as any).type || "";
    const dropType = (dropNode.item as any).type || "";

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
      isPage
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
      role="tree"
      aria-label={t("Email blocks")}
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
            activeId={activeId}
            onActiveIdChange={setActiveId}
          />
        ))}
      </DragDropProvider>
    </Box>
  );
}
