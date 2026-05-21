import React, { useCallback, useMemo, useState } from "react";
import { get, isArray, isObject } from "lodash";
import { useBlock, useEditorProps, useFocusIdx } from "@";
import { getContextMergeTags } from "@/extensions/utils/getContextMergeTags";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Box, InputAdornment, Popover, TextField } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface TreeNode {
  key: string;
  value: string;
  title: string;
  children: TreeNode[];
}

export const MergeTags: React.FC<{
  onChange: (v: string) => void;
  value: string;
  isSelect?: boolean;
}> = React.memo((props) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { focusIdx } = useFocusIdx();
  const {
    mergeTags = {},
    mergeTagGenerate,
    renderMergeTagContent,
  } = useEditorProps();
  const { values } = useBlock();

  const contextMergeTags = useMemo(
    () => getContextMergeTags(mergeTags, values, focusIdx),
    [mergeTags, values, focusIdx],
  );

  const treeOptions = useMemo(() => {
    const treeData: TreeNode[] = [];

    const deep = (
      key: string,
      title: string,
      parent: { [key: string]: any; children?: any[] },
      mapData: Array<TreeNode> = [],
    ) => {
      const currentMapData: TreeNode = {
        key: key,
        value: key,
        title: title,
        children: [],
      };

      mapData.push(currentMapData);
      const current = parent[title];
      if (current && typeof current === "object") {
        Object.keys(current).map((childKey) =>
          deep(
            key + "." + childKey,
            childKey,
            current,
            currentMapData.children,
          ),
        );
      }
    };

    Object.keys(contextMergeTags).map((key) =>
      deep(key, key, contextMergeTags, treeData),
    );
    return treeData;
  }, [contextMergeTags]);

  const handleItemSelection = useCallback(
    (_: any, itemId: string | null) => {
      if (!itemId) {
        return;
      }

      const value = get(contextMergeTags, itemId);

      // Ignore folder selections entirely (prevents keyboard Enter from selecting a folder)
      if (!value || isObject(value) || isArray(value)) {
        return;
      }

      // It's a leaf node! Apply the merge tag and close the popover if in Select mode
      props.onChange(mergeTagGenerate(itemId));
      if (props.isSelect) {
        setAnchorEl(null);
      }
    },
    [contextMergeTags, props, mergeTagGenerate],
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
      const isFolder = Array.isArray(node.children) && node.children.length > 0;

      return (
        <TreeItem
          key={node.key}
          itemId={node.key}
          label={
            <Box
              sx={{ width: "100%", py: 0.5 }}
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
              {node.title}
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
