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
import { useAddToCollection } from "@/extensions/hooks/useAddToCollection";
import { getBlockTitle } from "@/extensions/utils/getBlockTitle";
import { IframeCacheProvider } from "@/components/Provider/IframeCacheProvider";
import { AddBlockMenu } from "@/extensions/components/AddBlockMenu";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import DeleteIcon from "@mui/icons-material/Delete";

export function Toolbar() {
  const { copyBlock, removeBlock, focusBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { modal, setModalVisible } = useAddToCollection();
  const props = useEditorProps();
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  const isPage = focusBlock?.type === BasicType.PAGE;
  const isText = isTextBlock(focusBlock?.type);

  // Crucial for telling MUI where to render Tooltips inside the iframe
  const iframeBody = useMemo(() => {
    return getIframeDocument()?.body;
  }, []);

  const handleAddToCollection = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setModalVisible(true);
  };

  const handleCopy = (ev: React.MouseEvent<HTMLButtonElement>) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    copyBlock(focusIdx);
  };

  const handleDelete = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    removeBlock(focusIdx);
  };

  const handleSelectParent = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
            }}
          >
            {/* Block Title Container */}
            <Box
              sx={{
                color: "#ffffff",
                backgroundColor: "#1890ff",
                height: 22,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 5px",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                maxWidth: 300,
                overflow: "hidden",
              }}
            >
              <Typography variant="caption" sx={{ lineHeight: "22px" }}>
                {focusBlock && getBlockTitle(focusBlock, false)}
              </Typography>
            </Box>

            {/* Action Buttons Container */}
            <Box
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(ev) => ev.preventDefault()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
                backgroundColor: "#1890ff",
                height: 22,
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
