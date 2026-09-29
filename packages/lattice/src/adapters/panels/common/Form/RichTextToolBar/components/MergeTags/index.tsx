import React, { useCallback, useRef, useState } from "react";
import { Box, Popover } from "@mui/material";
import { MergeTags as MergeTagsOptions } from "@/adapters/panels/AttributePanel";
import { ToolItem } from "../ToolItem";
import DataObjectIcon from "@mui/icons-material/DataObject";

export interface MergeTagsProps {
  execCommand: (cmd: string, value: any) => void;
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
}

export function MergeTags(props: MergeTagsProps) {
  const { execCommand, getPopoverMountNode } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverId = React.useId();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.detail > 0) {
      triggerRef.current?.removeAttribute("data-keyboard-focus");
    }
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const onChange = useCallback(
    (val: string) => {
      execCommand("insertHTML", val);
      handleClose();
    },
    [execCommand],
  );

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <ToolItem
        ref={triggerRef}
        tabIndex={0}
        title={t("Merge tag")}
        icon={<DataObjectIcon aria-hidden="true" />}
        onClick={handleOpen}
        onMouseDown={(event) => event.preventDefault()}
        aria-controls={isOpen ? popoverId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        isActive={isOpen}
      />

      <Popover
        data-rich-text-toolbar-popup=""
        id={popoverId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableAutoFocus
        disableEnforceFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        container={
          getPopoverMountNode
            ? getPopoverMountNode()
            : anchorEl?.ownerDocument.body
        }
        slotProps={{
          transition: {
            onEntered: () => {
              anchorEl?.ownerDocument
                .getElementById(popoverId)
                ?.querySelector<HTMLElement>('[role="treeitem"]')
                ?.focus();
            },
          },
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
          onMouseDown={(e) => {
            e.stopPropagation();
            triggerRef.current?.removeAttribute("data-keyboard-focus");
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MergeTagsOptions value="" onChange={onChange} />
        </Box>
      </Popover>
    </>
  );
}
