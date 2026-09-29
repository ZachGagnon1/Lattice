import React, { useCallback, useRef, useState } from "react";
import { Box, Popover } from "@mui/material";
import { MergeTags as MergeTagsOptions } from "@/adapters/panels/AttributePanel";
import { ToolItem } from "../ToolItem";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { moveMergeTagFocus } from "./keyboard";
import { keepToolbarControlFocus, returnFocusToText } from "../../focus";

export interface MergeTagsProps {
  execCommand: (cmd: string, value: any) => void;
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
}

export function MergeTags(props: MergeTagsProps) {
  const { execCommand, getPopoverMountNode } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const keyboardInteractionRef = useRef(false);
  const popoverId = React.useId();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    keyboardInteractionRef.current = e.detail === 0;
    if (e.detail > 0) {
      triggerRef.current?.removeAttribute("data-keyboard-focus");
    }
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    requestAnimationFrame(() => {
      if (triggerRef.current) {
        keepToolbarControlFocus(
          triggerRef.current,
          keyboardInteractionRef.current,
        );
      }
    });
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
            keyboardInteractionRef.current = false;
            triggerRef.current?.removeAttribute("data-keyboard-focus");
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(event) => {
            keyboardInteractionRef.current = true;
            if (event.key === "Tab") {
              event.preventDefault();
              event.stopPropagation();
              setAnchorEl(null);
              returnFocusToText(props.selectionRange);
              return;
            }
            if (
              moveMergeTagFocus(event.currentTarget, event.target, event.key)
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <MergeTagsOptions value="" onChange={onChange} />
        </Box>
      </Popover>
    </>
  );
}
