import {
  BasicType,
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
import TuneIcon from "@mui/icons-material/Tune";
import { AddBlockMenu } from "@/adapters/panels/common/AddBlockMenu";
import { KeyboardShortcut } from "@/adapters/panels/common/KeyboardShortcut";
import {
  getBlockSettingsShortcutLabel,
  requestBlockSettings,
} from "@/shared/utils/blockSettingsNavigation";

export function BasicTools() {
  const { copyBlock, removeBlock, focusBlock } = useBlock();
  const isTableCell = focusBlock?.type === BasicType.TABLE;
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const { onAddCollection } = useEditorProps();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const shortcutLabel = userAgent.includes("Mac") ? "Fn+⌥F10" : "Alt+F10";

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
        flexWrap: "wrap",
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
        <KeyboardShortcut
          title={t("Shortcut to the text formatting toolbar")}
          borderColor="#aeb1b8"
        >
          {shortcutLabel}
        </KeyboardShortcut>
        <KeyboardShortcut
          title={t("Go to the block settings")}
          borderColor="#aeb1b8"
          style={{ marginLeft: 4 }}
        >
          {getBlockSettingsShortcutLabel(userAgent)}
        </KeyboardShortcut>
        {isTableCell && (
          <KeyboardShortcut
            title={t("Stop the edit and go back to the cells")}
            borderColor="#aeb1b8"
            style={{ marginLeft: 4 }}
          >
            Esc
          </KeyboardShortcut>
        )}
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
        onClick={() => requestBlockSettings()}
        title={t("Block settings")}
        aria-keyshortcuts="Alt+Enter"
        icon={<TuneIcon />}
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
