import {
  getIframeDocument,
  getParentIdx,
  useBlock,
  useEditorProps,
  useFocusIdx,
} from "@";
import { useAddToCollection } from "@/extensions/hooks/useAddToCollection";
import React, { useState } from "react";
import { ToolItem } from "./ToolItem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { Stack } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import { AddBlockMenu } from "@/extensions/components/AddBlockMenu";

export function BasicTools() {
  const { copyBlock, removeBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const { onAddCollection } = useEditorProps();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  const handleAddToCollection = () => {
    if (getIframeDocument()?.activeElement instanceof HTMLElement) {
      (getIframeDocument()?.activeElement as HTMLElement).blur();
    }
    setModalVisible(true);
  };

  const handleCopy: React.MouseEventHandler<any> = (ev) => {
    if (getIframeDocument()?.activeElement instanceof HTMLElement) {
      (getIframeDocument()?.activeElement as HTMLElement).blur();
    }
    copyBlock(focusIdx);
  };

  const handleDelete = () => {
    if (getIframeDocument()?.activeElement instanceof HTMLElement) {
      (getIframeDocument()?.activeElement as HTMLElement).blur();
    }
    removeBlock(focusIdx);
  };

  const handleSelectParent = () => {
    if (getIframeDocument()?.activeElement instanceof HTMLElement) {
      (getIframeDocument()?.activeElement as HTMLElement).blur();
    }
    setFocusIdx(getParentIdx(focusIdx)!);
  };

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
      }}
      style={{ marginRight: 40 }}
    >
      <span
        style={{
          position: "relative",
          marginRight: 10,
          color: "#fff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI",
        }}
      >
        Text
      </span>
      <ToolItem
        onClick={(ev) => setAddMenuAnchor(ev.currentTarget)}
        title={t("Add block")}
        icon={<AddIcon />}
      />
      <AddBlockMenu
        anchorEl={addMenuAnchor}
        onClose={() => setAddMenuAnchor(null)}
        container={getIframeDocument()?.body}
      />
      <ToolItem
        onClick={handleSelectParent}
        title={t("Select parent block")}
        icon={<ArrowUpwardIcon />}
      />
      <ToolItem
        onClick={handleCopy}
        title={t("Copy")}
        icon={<ContentCopyIcon />}
      />
      {onAddCollection && (
        <ToolItem
          onClick={handleAddToCollection}
          title={t("Add to collection")}
          icon={<LibraryAddIcon />}
        />
      )}
      <ToolItem
        onClick={handleDelete}
        title={t("Delete")}
        icon={<DeleteIcon />}
      />
      {modal}
    </Stack>
  );
}
