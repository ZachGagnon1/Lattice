import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Popover } from "@mui/material";
import { MergeTags as MergeTagsOptions } from "@/adapters/panels/AttributePanel";
import { ToolItem } from "../ToolItem";
import { getIframeDocument } from "@";
import DataObjectIcon from "@mui/icons-material/DataObject";

export interface MergeTagsProps {
  execCommand: (cmd: string, value: any) => void;
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
}

export function MergeTags(props: MergeTagsProps) {
  const { execCommand, selectionRange, getPopoverMountNode } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const lastKnownRange = useRef<Range | null>(null);

  useEffect(() => {
    if (selectionRange) {
      lastKnownRange.current = selectionRange.cloneRange();
    }
  }, [selectionRange]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onChange = useCallback(
    (val: string) => {
      if (lastKnownRange.current) {
        const iframeWindow = getIframeDocument()?.defaultView;
        if (iframeWindow) {
          iframeWindow.focus();
          const selection = iframeWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(lastKnownRange.current);
          }
        }
      }

      execCommand("insertHTML", val);
      handleClose();
    },
    [execCommand],
  );

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <span
        style={{
          height: "27px",
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ToolItem
          title={t("Merge tag")}
          icon={<DataObjectIcon />}
          onClick={handleOpen}
          isActive={isOpen}
        />
      </span>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        container={
          getPopoverMountNode
            ? getPopoverMountNode()
            : anchorEl?.ownerDocument.body
        }
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "background.paper",
              zIndex: 10,
              // FIX: Constrain height and enable scrolling for long lists
              maxHeight: 350,
              maxWidth: 300,
              overflowY: "auto",
              overflowX: "hidden",
            },
          },
        }}
      >
        <Box
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MergeTagsOptions value="" onChange={onChange} />
        </Box>
      </Popover>
    </>
  );
}
