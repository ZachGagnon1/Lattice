import {
  getIframeDocument,
  getParentIdx,
  useBlock,
  useEditorProps,
  useFocusIdx,
} from "@";
import { useAddToCollection } from "@/application/hooks/useAddToCollection";
import React, { useState } from "react";
import { ToolItem } from "./ToolItem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { Stack } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import { AddBlockMenu } from "@/adapters/panels/common/AddBlockMenu";

export function BasicTools() {
  const { copyBlock, removeBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const { onAddCollection } = useEditorProps();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const shortcutLabel =
    typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
      ? "Fn+⌥F10"
      : "Alt+F10";

  // These actions move or remove the block, so the text must not keep the focus.
  const blurThen = (action: () => void) => () => {
    (getIframeDocument()?.activeElement as HTMLElement | null)?.blur();
    action();
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
        <kbd
          title={t("Shortcut to the text formatting toolbar")}
          style={{
            marginLeft: 8,
            padding: "1px 5px",
            border: "1px solid #aeb1b8",
            borderRadius: 3,
            fontSize: 11,
          }}
        >
          {shortcutLabel}
        </kbd>
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
        onClick={blurThen(() => setFocusIdx(getParentIdx(focusIdx)!))}
        title={t("Select parent block")}
        icon={<ArrowUpwardIcon />}
      />
      <ToolItem
        onClick={blurThen(() => copyBlock(focusIdx))}
        title={t("Copy")}
        icon={<ContentCopyIcon />}
      />
      {onAddCollection && (
        <ToolItem
          onClick={blurThen(() => setModalVisible(true))}
          title={t("Add to collection")}
          icon={<LibraryAddIcon />}
        />
      )}
      <ToolItem
        onClick={blurThen(() => removeBlock(focusIdx))}
        title={t("Delete")}
        icon={<DeleteIcon />}
      />
      {modal}
    </Stack>
  );
}
