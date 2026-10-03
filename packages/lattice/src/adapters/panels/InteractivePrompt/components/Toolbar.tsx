import React, { useMemo, useState } from "react";
import {
  BasicType,
  getIframeDocument,
  getParentIdx,
  isTextBlock,
  useBlock,
  useEditorProps,
  useFocusIdx,
} from "@";
import { useAddToCollection } from "@/application/hooks/useAddToCollection";
import { getBlockTitle } from "@/shared/utils/panel/getBlockTitle";
import { IframeCacheProvider } from "@/adapters/ui/Provider/IframeCacheProvider";
import { AddBlockMenu } from "@/adapters/panels/common/AddBlockMenu";
import { KeyboardShortcut } from "@/adapters/panels/common/KeyboardShortcut";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import { EDITOR_SELECTED_COLOR } from "@/shared/utils/overlayAccessibility";
import {
  BLOCK_KEYBOARD_HINT_CLASS,
  focusBlockSelectionSurface,
  focusAdjacentBlock,
  TABLE_CELL_HINT_CLASS,
  TABLE_EDIT_HINT_CLASS,
  TOOLBAR_KEYBOARD_HINT_CLASS,
} from "@/shared/utils/canvasBlockAccessibility";
import {
  getNextIndex,
  getToolbarItems,
} from "@/adapters/panels/common/Form/RichTextToolBar/focus";

export function Toolbar() {
  const { copyBlock, removeBlock, focusBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const props = useEditorProps();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  const isPage = focusBlock?.type === BasicType.PAGE;
  const isText = isTextBlock(focusBlock?.type);
  const isTable = focusBlock?.type === BasicType.TABLE;

  // Crucial for telling MUI where to render Tooltips inside the iframe
  const iframeBody = useMemo(() => {
    return getIframeDocument()?.body;
  }, []);

  const handleAddToCollection = () => {
    setModalVisible(true);
  };

  const handleCopy = () => {
    copyBlock(focusIdx);
  };

  const handleDelete = () => {
    removeBlock(focusIdx);
  };

  const handleSelectParent = () => {
    setFocusIdx(getParentIdx(focusIdx)!);
  };

  if (isText) return null;

  return (
    <>
      <IframeCacheProvider>
        <Box
          id="easy-email-extensions-InteractivePrompt-Toolbar"
          sx={{
            height: 0,
            zIndex: 100,
            position: "absolute", // Ensure the toolbar floats correctly
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          <Box
            sx={{
              pointerEvents: "auto",
              color: "#ffffff",
              transform: "translateY(-100%)",
              display: "inline-flex",
              [[
                BLOCK_KEYBOARD_HINT_CLASS,
                TOOLBAR_KEYBOARD_HINT_CLASS,
                TABLE_CELL_HINT_CLASS,
                TABLE_EDIT_HINT_CLASS,
              ]
                .map((name) => `& .${name}`)
                .join(", ")]: { display: "none" },
              [`&:has([role=toolbar]:focus-within) .${TOOLBAR_KEYBOARD_HINT_CLASS}`]:
                { display: "inline" },
            }}
          >
            {/* Block Title Container */}
            <Box
              sx={{
                color: "#ffffff",
                backgroundColor: EDITOR_SELECTED_COLOR,
                minHeight: 22,
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 6px",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                maxWidth: 420,
                overflow: "hidden",
              }}
            >
              <Typography variant="caption">
                {focusBlock && getBlockTitle(focusBlock, false)}
              </Typography>
              <KeyboardShortcut
                title={t("Shortcut to the block actions")}
                borderColor="#ffffff"
                className={BLOCK_KEYBOARD_HINT_CLASS}
              >
                Enter
              </KeyboardShortcut>
              <KeyboardShortcut
                title={t("Move between the block actions")}
                borderColor="#ffffff"
                className={TOOLBAR_KEYBOARD_HINT_CLASS}
              >
                ← →
              </KeyboardShortcut>
              <KeyboardShortcut
                title={t("Return to the block")}
                borderColor="#ffffff"
                className={TOOLBAR_KEYBOARD_HINT_CLASS}
                style={{ marginLeft: 4 }}
              >
                Esc
              </KeyboardShortcut>
              {isTable && (
                <>
                  <KeyboardShortcut
                    title={t("Edit the cell")}
                    borderColor="#ffffff"
                    className={TABLE_CELL_HINT_CLASS}
                  >
                    Enter
                  </KeyboardShortcut>
                  <KeyboardShortcut
                    title={t("Open the table menu")}
                    borderColor="#ffffff"
                    className={TABLE_CELL_HINT_CLASS}
                    style={{ marginLeft: 4 }}
                  >
                    Shift+F10
                  </KeyboardShortcut>
                  <KeyboardShortcut
                    title={t("Go to the table block")}
                    borderColor="#ffffff"
                    className={TABLE_CELL_HINT_CLASS}
                    style={{ marginLeft: 4 }}
                  >
                    Esc
                  </KeyboardShortcut>
                  <KeyboardShortcut
                    title={t("Stop the edit")}
                    borderColor="#ffffff"
                    className={TABLE_EDIT_HINT_CLASS}
                  >
                    Esc
                  </KeyboardShortcut>
                </>
              )}
            </Box>

            {/* Action Buttons Container */}
            <Box
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(ev) => ev.preventDefault()}
              role="toolbar"
              aria-label={t("Block actions")}
              onKeyDown={(event) => {
                const iframeDocument = getIframeDocument();
                if (!iframeDocument) return;
                const items = getToolbarItems(event.currentTarget);
                const nextItem =
                  items[
                    getNextIndex(
                      event.key,
                      items.indexOf(event.target as HTMLButtonElement),
                      items.length,
                    )
                  ];
                if (nextItem) {
                  event.preventDefault();
                  nextItem.focus();
                  return;
                }
                // Tab continues the walk through the blocks, so the actions do not trap the user.
                const leaveToNextBlock =
                  event.key === "Tab" &&
                  !event.shiftKey &&
                  focusAdjacentBlock(iframeDocument, focusIdx, false);
                const leaveToBlock =
                  event.key === "Escape" ||
                  (event.key === "Tab" && event.shiftKey);
                if (leaveToNextBlock) {
                  event.preventDefault();
                } else if (leaveToBlock) {
                  event.preventDefault();
                  focusBlockSelectionSurface(iframeDocument, focusIdx);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
                backgroundColor: EDITOR_SELECTED_COLOR,
                minHeight: 26,
                "& button:focus-visible": {
                  outline: "2px solid #ffffff",
                  outlineOffset: -3,
                },
                "@media (forced-colors: active)": {
                  border: "1px solid ButtonText",
                },
              }}
            >
              <Tooltip
                title="Add Block"
                slotProps={{ popper: { container: iframeBody } }}
              >
                <IconButton
                  aria-label="Add Block"
                  aria-haspopup="menu"
                  onClick={(ev) => setAddMenuAnchor(ev.currentTarget)}
                  sx={{
                    color: "inherit",
                    p: 0,
                    width: 22,
                    height: 22,
                    borderRadius: 0,
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {!isPage && (
                <>
                  <Tooltip
                    title="Select Parent"
                    slotProps={{ popper: { container: iframeBody } }}
                  >
                    <IconButton
                      aria-label="Select Parent"
                      onClick={handleSelectParent}
                      sx={{
                        color: "inherit",
                        p: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 0,
                      }}
                    >
                      <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title="Copy"
                    slotProps={{ popper: { container: iframeBody } }}
                  >
                    <IconButton
                      aria-label="Copy Block"
                      onClick={handleCopy}
                      sx={{
                        color: "inherit",
                        p: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 0,
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>

                  {props.onAddCollection && (
                    <Tooltip
                      title="Add to Collection"
                      slotProps={{ popper: { container: iframeBody } }}
                    >
                      <IconButton
                        aria-label="Add to Collection"
                        onClick={handleAddToCollection}
                        sx={{
                          color: "inherit",
                          p: 0,
                          width: 22,
                          height: 22,
                          borderRadius: 0,
                        }}
                      >
                        <LibraryAddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip
                    title="Delete"
                    slotProps={{ popper: { container: iframeBody } }}
                  >
                    <IconButton
                      aria-label="Delete Block"
                      onClick={handleDelete}
                      sx={{
                        color: "inherit",
                        p: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 0,
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>
        <AddBlockMenu
          anchorEl={addMenuAnchor}
          onClose={() => setAddMenuAnchor(null)}
          container={iframeBody}
        />
      </IframeCacheProvider>
      {modal}
    </>
  );
}
