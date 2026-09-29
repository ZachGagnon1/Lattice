import React, { useRef, useState } from "react";
import { Box, MenuItem, MenuList, Popover } from "@mui/material";
import { ToolItem } from "@/adapters/panels/common/Form/RichTextToolBar/components/ToolItem";
import { keepToolbarControlFocus, returnFocusToText } from "../focus";

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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const keyboardInteractionRef = useRef(false);

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

  const handleSelect = (val: string) => {
    onSelect(val);
    handleClose();
  };

  const isOpen = Boolean(anchorEl);
  const menuId = `text-format-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <>
      <span style={{ height: "27px" }} onMouseDown={(e) => e.preventDefault()}>
        <ToolItem
          ref={triggerRef}
          onClick={handleOpen}
          isActive={isOpen}
          title={title}
          icon={icon}
          aria-controls={isOpen ? menuId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        />
      </span>

      <Popover
        data-rich-text-toolbar-popup=""
        id={menuId}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableEnforceFocus
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
              returnFocusToText(selectionRange);
            }
          }}
        >
          <MenuList autoFocusItem={isOpen} dense sx={{ py: 0 }}>
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
