import React from "react";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { MergeTags as MergeTagTree } from "@/adapters/panels/AttributePanel";
import { ToolItem } from "../ToolItem";
import { ToolbarPopover, useToolbarPopup } from "../ToolbarPopover";
import { useToolbar } from "../../ToolbarContext";
import { moveMergeTagFocus } from "./keyboard";

export function MergeTags() {
  const { execCommand } = useToolbar();
  const popup = useToolbarPopup();

  return (
    <>
      <ToolItem
        {...popup.triggerProps}
        title={t("Merge tag")}
        icon={<DataObjectIcon />}
        isActive={popup.isOpen}
        aria-haspopup="tree"
      />
      <ToolbarPopover
        popup={popup}
        initialFocus='[role="treeitem"]'
        paperSx={{
          sx: { maxHeight: 350, maxWidth: 300, overflowY: "auto" },
        }}
      >
        <div
          onKeyDown={(event) => {
            if (
              moveMergeTagFocus(event.currentTarget, event.target, event.key)
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <MergeTagTree
            value=""
            onChange={(value: string) => {
              popup.close();
              execCommand("insertHTML", value);
            }}
          />
        </div>
      </ToolbarPopover>
    </>
  );
}
