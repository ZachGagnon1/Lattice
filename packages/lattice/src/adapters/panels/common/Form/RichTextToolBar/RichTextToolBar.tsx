import React, { useEffect, useState } from "react";
import {
  FIXED_CONTAINER_ID,
  getIframeDocument,
  RICH_TEXT_BAR_ID,
  useEditorContext,
  useFocusBlockLayout,
} from "@";
import { Tools } from "./components/Tools";
import styleText from "./shadow-dom.scss?inline";
import { createPortal } from "react-dom";
import { IframeCacheProvider } from "@/adapters/ui/Provider/IframeCacheProvider";

export function RichTextToolBar(props: { onChange: (s: string) => void }) {
  const { initialized } = useEditorContext();
  const { focusBlockNode } = useFocusBlockLayout();
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Track the position of the focused block dynamically
  useEffect(() => {
    if (!focusBlockNode) return;

    const updateRect = () => {
      setRect(focusBlockNode.getBoundingClientRect());
    };

    // Calculate immediately
    updateRect();

    const win = getIframeDocument()?.defaultView;
    if (win) {
      // Use capture phase (true) to catch scrolling in child containers
      win.addEventListener("scroll", updateRect, true);
      win.addEventListener("resize", updateRect);
    }

    return () => {
      if (win) {
        win.removeEventListener("scroll", updateRect, true);
        win.removeEventListener("resize", updateRect);
      }
    };
  }, [focusBlockNode]);

  const doc = getIframeDocument();
  // Portal to the main fixed container or body, bypassing column constraints
  const portalTarget = doc?.getElementById(FIXED_CONTAINER_ID) || doc?.body;
  const root = initialized && focusBlockNode && portalTarget;

  if (!root || !rect) return null;

  // Smart positioning: Try above by 45px. If it hits the top bounds of the screen, render it below.
  const topPosition = rect.top >= 45 ? rect.top - 45 : rect.bottom + 10;

  return createPortal(
    <IframeCacheProvider>
      <>
        <style dangerouslySetInnerHTML={{ __html: styleText }} />
        <div
          id={RICH_TEXT_BAR_ID}
          style={{
            position: "fixed", // Relative to iframe viewport instead of a column
            top: topPosition,
            left: "50%", // Perfect center to the whole email width
            transform: "translateX(-50%)",
            padding: "4px 15px",
            boxSizing: "border-box",
            zIndex: 100,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              position: "absolute",
              backgroundColor: "#41444d",
              height: "100%",
              width: "100%",
              left: 0,
              top: 0,
              borderRadius: "4px", // Slight border radius for polish
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Tools onChange={props.onChange} />
          </div>
        </div>
      </>
    </IframeCacheProvider>,
    portalTarget,
  );
}
