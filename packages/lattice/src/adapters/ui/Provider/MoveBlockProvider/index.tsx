import React, { useEffect, useMemo, useState } from "react";
import { getIframeDocument } from "@/shared/utils/getEditorRoot";
import { focusBlockSelectionSurface } from "@/shared/utils/canvasBlockAccessibility";
import { useEditorStatus } from "@/application/hooks/useEditorStatus";

export const MoveBlockContext = React.createContext<{
  sourceIdx: string | null;
  setSourceIdx: (idx: string | null) => void;
}>({ sourceIdx: null, setSourceIdx: () => {} });

/** Holds the block that waits for a destination in move mode. */
export function MoveBlockProvider({ children }: { children: React.ReactNode }) {
  const [sourceIdx, setSourceIdx] = useState<string | null>(null);
  const { announce } = useEditorStatus();

  // The capture phase runs first, so the Escape of a toolbar or a text does not take the key.
  useEffect(() => {
    const iframeDocument = getIframeDocument();
    if (!sourceIdx || !iframeDocument) return;
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setSourceIdx(null);
      announce(t("The move is canceled"));
      focusBlockSelectionSurface(iframeDocument, sourceIdx);
    };
    iframeDocument.addEventListener("keydown", cancelOnEscape, true);
    return () =>
      iframeDocument.removeEventListener("keydown", cancelOnEscape, true);
  }, [announce, sourceIdx]);

  const value = useMemo(() => ({ sourceIdx, setSourceIdx }), [sourceIdx]);
  return (
    <MoveBlockContext.Provider value={value}>
      {children}
    </MoveBlockContext.Provider>
  );
}
