import React, { useCallback, useMemo, useState } from "react";
import { useBlock, useEditorProps, useFocusIdx } from "@";
import {
  getScopedMergeTags,
  isExpandable,
  type ScopedMergeTagEntry,
} from "@/shared/utils/panel/mergeTagScope";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Box, InputAdornment, Popover, TextField } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

/**
 * One row of the merge tag picker.
 *
 * `key` is the MUI item id. It is scope qualified, so a loop field and a global
 * with the same name stay apart. `emitPath` is the path the editor inserts, so
 * a loop field shows `name` but emits `product.name`.
 */
export interface TreeNode {
  /** The unique MUI item id. */
  key: string;
  /** The bare label the row shows. */
  title: string;
  /** The path that `onChange` receives. */
  emitPath: string;
  /** The sample value behind the row. */
  sample: any;
  /** `true` when a click on the row inserts the path. */
  selectable: boolean;
  /** `true` when the row is a folder. */
  expandable: boolean;
  kind: ScopedMergeTagEntry["kind"];
  children: TreeNode[];
}

/** Return the last segment of a dotted path. */
function lastSegment(path: string): string {
  const segments = path.split(".");
  return segments[segments.length - 1] || path;
}

export const MergeTags: React.FC<{
  onChange: (v: string) => void;
  value: string;
  isSelect?: boolean;
  /** When true, the picker emits the raw path, with no `{{ }}` around it. */
  rawPath?: boolean;
  /** When true, only an array is selectable. Use it for a loop source picker. */
  arraysOnly?: boolean;
  /** When true, the loop of the focused block itself is in scope. */
  includeSelfLoop?: boolean;
}> = React.memo((props) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { focusIdx } = useFocusIdx();
  const {
    variableData = {},
    mergeTagGenerate,
    renderMergeTagContent,
  } = useEditorProps();
  const { values } = useBlock();

  const includeSelfLoop = props.includeSelfLoop ?? false;
  const arraysOnly = props.arraysOnly ?? false;

  const scoped = useMemo(
    () =>
      getScopedMergeTags(variableData, values, focusIdx, { includeSelfLoop }),
    [variableData, values, focusIdx, includeSelfLoop],
  );

  const { treeOptions, nodeIndex } = useMemo(() => {
    const roots: TreeNode[] = [];
    const index = new Map<string, TreeNode>();

    const isSelectable = (
      sample: any,
      kind: ScopedMergeTagEntry["kind"],
    ): boolean => {
      // A loop folder is a container. It never inserts a path.
      if (kind === "loop-group") return false;
      if (arraysOnly) return Array.isArray(sample);
      // A plain object is a container. A leaf or an array is selectable.
      return !isExpandable(sample);
    };

    const build = (
      key: string,
      title: string,
      emitPath: string,
      sample: any,
      kind: ScopedMergeTagEntry["kind"],
      target: TreeNode[],
    ) => {
      const node: TreeNode = {
        key,
        title,
        emitPath,
        sample,
        selectable: isSelectable(sample, kind),
        expandable: isExpandable(sample),
        kind,
        children: [],
      };

      target.push(node);
      index.set(key, node);

      // Only a plain object expands. An array is terminal, because
      // `{{products.0.name}}` is never a valid path.
      if (!node.expandable) return;

      Object.keys(sample as Record<string, any>).forEach((childKey) => {
        build(
          `${key}.${childKey}`,
          childKey,
          `${emitPath}.${childKey}`,
          (sample as Record<string, any>)[childKey],
          kind,
          node.children,
        );
      });
    };

    // `scoped.roots` is already in the required order. Keep it.
    scoped.roots.forEach((entry) => {
      const id =
        entry.kind === "global"
          ? entry.displayPath
          : `@${entry.scope?.idx ?? "loop"}:${entry.displayPath}`;

      build(
        id,
        lastSegment(entry.displayPath),
        entry.emitPath,
        entry.value,
        entry.kind,
        roots,
      );
    });

    return { treeOptions: roots, nodeIndex: index };
  }, [scoped, arraysOnly]);

  const handleItemSelection = useCallback(
    (_: any, itemId: string | null) => {
      const node = itemId ? nodeIndex.get(itemId) : undefined;
      if (!node || !node.selectable) return;

      props.onChange(
        props.rawPath ? node.emitPath : mergeTagGenerate(node.emitPath),
      );
      if (props.isSelect) {
        setAnchorEl(null);
      }
    },
    [nodeIndex, props, mergeTagGenerate],
  );

  const mergeTagContent = useMemo(
    () =>
      renderMergeTagContent ? (
        renderMergeTagContent({
          onChange: props.onChange,
          isSelect: Boolean(props.isSelect),
          value: props.value,
        })
      ) : (
        <></>
      ),
    [renderMergeTagContent, props.onChange, props.isSelect, props.value],
  );

  if (renderMergeTagContent) {
    return <>{mergeTagContent}</>;
  }

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => {
      const isFolder = node.expandable;
      // A folder must stay enabled, because x-tree-view v9 cannot expand a
      // disabled item. Dim the label instead. Only a leaf gets `disabled`.
      const dimLabel = !node.selectable && isFolder;
      const showHint = node.kind === "loop-field";

      return (
        <TreeItem
          key={node.key}
          itemId={node.key}
          disabled={!node.selectable && !isFolder}
          label={
            <Box
              sx={{
                width: "100%",
                py: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                opacity: dimLabel ? 0.45 : 1,
                cursor: dimLabel ? "default" : undefined,
              }}
              onClick={(e) => {
                // If they click a folder label, stop MUI from selecting it and manually toggle the expansion
                if (isFolder) {
                  e.stopPropagation();
                  e.preventDefault();
                  setExpandedKeys((keys) => {
                    if (keys.includes(node.key)) {
                      return keys.filter((k) => k !== node.key);
                    } else {
                      return [...keys, node.key];
                    }
                  });
                }
              }}
            >
              <Box component="span" sx={{ flexGrow: 1, minWidth: 0 }}>
                {node.title}
              </Box>
              {showHint ? (
                <Box
                  component="span"
                  sx={{
                    color: "text.secondary",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.emitPath}
                </Box>
              ) : null}
            </Box>
          }
        >
          {isFolder ? renderTree(node.children) : null}
        </TreeItem>
      );
    });
  };

  const TreeComponent = (
    <Box
      onMouseDown={(e) => {
        // CRITICAL FIX: Prevent the tree from stealing focus from the iframe!
        // Only do this if it's NOT the select input, so we don't break standard dropdowns.
        if (!props.isSelect) {
          e.preventDefault();
        }
      }}
    >
      <SimpleTreeView
        expandedItems={expandedKeys}
        onExpandedItemsChange={(e, newExpandedItems) =>
          setExpandedKeys(newExpandedItems)
        }
        onSelectedItemsChange={handleItemSelection}
      >
        {renderTree(treeOptions)}
      </SimpleTreeView>
    </Box>
  );

  return (
    <Box sx={{ color: "#333", width: "100%" }}>
      {props.isSelect ? (
        <>
          {/* Mock "Select" Input */}
          <TextField
            value={props.value || ""}
            size="small"
            fullWidth
            placeholder={t("Please select")}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            slotProps={{
              input: {
                readOnly: true, // Prevent typing, acts like a pure dropdown
                endAdornment: (
                  <InputAdornment position="end">
                    <ArrowDropDownIcon />
                  </InputAdornment>
                ),
                sx: { cursor: "pointer" },
              },
            }}
          />
          {/* Dropdown Menu carrying the Tree */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: anchorEl
                    ? Math.max(anchorEl.clientWidth, 280)
                    : 280,
                  maxWidth: 450,
                  maxHeight: 350,
                  overflow: "auto",
                  p: 1.5,
                },
              },
            }}
          >
            {TreeComponent}
          </Popover>
        </>
      ) : (
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>{TreeComponent}</Box>
      )}
    </Box>
  );
});
