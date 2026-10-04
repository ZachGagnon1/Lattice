import React, { useEffect, useRef } from "react";
import { getIframeDocument, useFocusIdx } from "@";
import {
  BLOCK_SETTINGS_ATTRIBUTE,
  focusBlockWhenReady,
  isCanvasReturnKey,
  requestCanvasReturn,
} from "@/shared/utils/blockSettingsNavigation";

/** Holds the fields of the selected block. Escape or Alt+Enter in a field returns the focus to the block. */
export function BlockSettings({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { focusIdx } = useFocusIdx();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // A native listener, because React also bubbles the keys of a popup that a field portals out of the panel.
    const returnToCanvas = (event: KeyboardEvent) => {
      const iframeDocument = getIframeDocument();
      if (!iframeDocument || !isCanvasReturnKey(event)) return;
      event.preventDefault();
      requestCanvasReturn();
      focusBlockWhenReady(iframeDocument, focusIdx);
    };
    element.addEventListener("keydown", returnToCanvas);
    return () => element.removeEventListener("keydown", returnToCanvas);
  }, [focusIdx]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      {...{ [BLOCK_SETTINGS_ATTRIBUTE]: "" }}
    >
      {children}
    </div>
  );
}
