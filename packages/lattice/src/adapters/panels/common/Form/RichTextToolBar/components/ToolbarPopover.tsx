import React, { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Box, Popover, PopoverProps } from "@mui/material";
import { useToolbar } from "../ToolbarContext";

export function useToolbarPopup() {
  const { returnToText } = useToolbar();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const returnToTriggerRef = useRef(false);
  const id = useId();
  const isOpen = Boolean(anchorEl);

  const open = (event: React.MouseEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    // A mouse click keeps the focus in the text, because each tool prevents the mousedown.
    returnToTriggerRef.current =
      trigger.ownerDocument.activeElement === trigger;
    setAnchorEl(trigger);
  };

  /**
   * `text` is for Tab, which leaves the toolbar. Other closes go back to where the focus was.
   * Call it before a command, so the command runs with the focus already back in place.
   */
  const close = (to: "trigger" | "text" = "trigger") => {
    const trigger = anchorEl;
    // The focus trap of an open dialog pulls the focus back. Close it before the focus moves.
    flushSync(() => setAnchorEl(null));
    if (
      to === "trigger" &&
      returnToTriggerRef.current &&
      trigger?.isConnected
    ) {
      trigger.focus({ preventScroll: true });
    } else {
      returnToText();
    }
  };

  const triggerProps = {
    onClick: open,
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? id : undefined,
  };

  return { id, anchorEl, isOpen, open, close, triggerProps };
}

export type ToolbarPopup = ReturnType<typeof useToolbarPopup>;

export interface ToolbarPopoverProps {
  popup: ToolbarPopup;
  /**
   * The accessible name of a dialog. A dialog keeps Tab inside it.
   * Leave it out for a menu, where Tab closes the menu and returns to the text.
   */
  label?: string;
  /**
   * Gets the focus when the popover opens. With a list, the first selector that matches wins.
   * The popover does not focus itself: the browser then scrolls the page around the iframe.
   */
  initialFocus: string | string[];
  paperSx?: NonNullable<PopoverProps["slotProps"]>["paper"];
  children: React.ReactNode;
}

export function ToolbarPopover({
  popup,
  label,
  initialFocus,
  paperSx,
  children,
}: Readonly<ToolbarPopoverProps>) {
  const { id, anchorEl, isOpen, close } = popup;

  return (
    <Popover
      data-rich-text-toolbar-popup=""
      id={id}
      open={isOpen}
      anchorEl={anchorEl}
      onClose={() => close()}
      container={anchorEl?.ownerDocument.body}
      disableEnforceFocus={!label}
      disableRestoreFocus
      disableAutoFocus
      // The toolbar is fixed, so it needs no scroll lock. The lock moves the page when it ends.
      disableScrollLock
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      sx={{ zIndex: 10000 }}
      slotProps={{
        transition: {
          onEntered: (node) => {
            const selectors = [initialFocus].flat();
            const target = selectors
              .map((selector) => node.querySelector<HTMLElement>(selector))
              .find(Boolean);
            target?.focus({ preventScroll: true });
          },
        },
        paper: {
          ...(label ? { role: "dialog", "aria-label": label } : {}),
          ...paperSx,
        },
      }}
    >
      <Box
        // The editor selects a block on mousedown. A click in the popover must not do that.
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (label || event.key !== "Tab") return;
          event.preventDefault();
          event.stopPropagation();
          close("text");
        }}
      >
        {children}
      </Box>
    </Popover>
  );
}
