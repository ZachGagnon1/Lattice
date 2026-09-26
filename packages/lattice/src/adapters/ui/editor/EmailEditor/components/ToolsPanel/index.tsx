import React from "react";
import { useBlock } from "@/application/hooks/useBlock";
import { IconButton, Stack, Tooltip } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

export function ToolsPanel() {
  const { redo, undo, redoable, undoable } = useBlock();

  return (
    <Stack spacing={2} direction="row">
      <Tooltip title={t("undo")}>
        <IconButton disabled={!undoable} onClick={undo}>
          <UndoIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={t("Redo")}>
        <IconButton disabled={!redoable} onClick={redo}>
          <RedoIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
