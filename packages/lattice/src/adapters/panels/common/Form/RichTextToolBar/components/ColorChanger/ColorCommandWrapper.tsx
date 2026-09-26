import { ColorPicker } from "../../../ColorPicker/ColorPickerInput";
import { getIframeDocument } from "@";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";

export interface ColorCommandWrapperProps {
  command: string;
  selectionRange: Range | null;
  execCommand: (cmd: string, val?: any) => void;
  styleKey: "color" | "backgroundColor";
  children: (color: string | undefined) => React.ReactNode;
}

export function ColorCommandWrapper({
  command,
  selectionRange,
  execCommand,
  styleKey,
  children,
}: Readonly<ColorCommandWrapperProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string | undefined>(undefined);
  const [color, setColor] = useState("");

  useEffect(() => {
    setColor(activeColor ?? "");
  }, [activeColor]);

  const lastKnownRange = useRef<Range | null>(null);

  useEffect(() => {
    if (selectionRange) {
      lastKnownRange.current = selectionRange.cloneRange();
    }
  }, [selectionRange]);

  useEffect(() => {
    if (isOpen && lastKnownRange.current) {
      const range = lastKnownRange.current;
      let foundColor: string | undefined = undefined;

      if (range.commonAncestorContainer instanceof HTMLElement) {
        foundColor = getComputedStyle(range.commonAncestorContainer)[styleKey];
      } else if (range.commonAncestorContainer.parentNode) {
        foundColor = getComputedStyle(
          range.commonAncestorContainer.parentNode as HTMLElement,
        )[styleKey];
      }

      setActiveColor(foundColor);
    }
  }, [isOpen, styleKey]);

  // A drag on the picker must not select the email text behind the popover.
  useEffect(() => {
    if (!isOpen) return;
    const iframeBody = getIframeDocument()?.body;
    if (!iframeBody) return;

    const prevUserSelect = iframeBody.style.getPropertyValue("user-select");
    iframeBody.style.setProperty("user-select", "none", "important");
    return () => {
      if (prevUserSelect) {
        iframeBody.style.setProperty("user-select", prevUserSelect);
      } else {
        iframeBody.style.removeProperty("user-select");
      }
    };
  }, [isOpen]);

  const onSubmit = useCallback(() => {
    const iframeWindow = getIframeDocument()?.defaultView;
    const range = lastKnownRange.current;

    if (iframeWindow && range) {
      iframeWindow.focus();
      const selection = iframeWindow.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    execCommand(command, color);
    setActiveColor(color);

    if (iframeWindow) {
      const newSelection = iframeWindow.getSelection();
      if (newSelection && newSelection.rangeCount > 0) {
        lastKnownRange.current = newSelection.getRangeAt(0).cloneRange();
      }
    }

    setIsOpen(false);
  }, [color, command, execCommand]);

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      showInput={false}
      onVisibilityChange={setIsOpen}
      isOpen={isOpen}
    >
      {children(activeColor)}

      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="small" onClick={onSubmit}>
          Apply
        </Button>
      </Box>
    </ColorPicker>
  );
}
