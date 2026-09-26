import React, { useEffect, useRef, useState } from "react";
import { Box, MenuItem, MenuList, Popover } from "@mui/material";
import { getIframeDocument } from "@";
import { ToolItem } from "@/adapters/panels/common/Form/RichTextToolBar/components/ToolItem";

export interface DropdownOption {
  value: string;
  label: string | React.ReactNode;
}

export interface DropdownCommandWrapperProps {
  title: string;
  icon: React.ReactNode;
  options: DropdownOption[];
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
  onSelect: (val: string) => void;
}

export function DropdownCommandWrapper({
  title,
  icon,
  options,
  selectionRange,
  getPopoverMountNode,
  onSelect,
}: Readonly<DropdownCommandWrapperProps>) {
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

  const handleSelect = (val: string) => {
    // Restore focus to iframe before executing command
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

    onSelect(val);
    handleClose();
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <span style={{ height: "27px" }} onMouseDown={(e) => e.preventDefault()}>
        <ToolItem
          onClick={handleOpen}
          isActive={isOpen}
          title={title}
          icon={icon}
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
              maxWidth: 150,
              maxHeight: 350,
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
          <MenuList dense sx={{ py: 0 }}>
            {options.map((item) => (
              <MenuItem
                key={item.value}
                onClick={() => handleSelect(item.value)}
                sx={{
                  minHeight: 30,
                  lineHeight: "30px",
                  py: 0.5,
                  fontSize: 14,
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
        </Box>
      </Popover>
    </>
  );
}
