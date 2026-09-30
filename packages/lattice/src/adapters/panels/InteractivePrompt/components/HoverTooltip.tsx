import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import {
  BlockManager,
  getIframeDocument,
  getNodeTypeFromClassName,
  useEditorContext,
  useFocusIdx,
  useHoverIdx,
  useLazyState,
} from "@";
import { awaitForElement } from "@/shared/utils/panel/awaitForElement";
import { IframeCacheProvider } from "@/adapters/ui/Provider/IframeCacheProvider";

// A lighter shade of the main toolbar blue (#1890ff)
const HOVER_COLOR = "#40a9ff";

export function HoverTooltip() {
  const { hoverIdx, direction, isDragging } = useHoverIdx();
  const lazyHoverIdx = useLazyState(hoverIdx, 60);
  const { focusIdx } = useFocusIdx();
  const [isTop, setIsTop] = useState(false);
  const { initialized } = useEditorContext();

  const [blockNode, setBlockNode] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const iframeDocument = getIframeDocument();

    if (initialized && iframeDocument) {
      rootRef.current = iframeDocument.body.getBoundingClientRect();
    }
  }, [initialized]);

  useEffect(() => {
    const rootBounds = rootRef.current;
    if (!initialized) return;

    if (lazyHoverIdx) {
      const promiseObj = awaitForElement<HTMLDivElement>(lazyHoverIdx);
      promiseObj.promise.then((blockNode) => {
        if (rootBounds) {
          const { top } = blockNode.getBoundingClientRect();
          setIsTop(rootBounds.top === top);
        }

        setBlockNode(blockNode);
      });

      return () => {
        promiseObj.cancel();
      };
    } else {
      setBlockNode(null);
    }
  }, [lazyHoverIdx, initialized]);

  const block = useMemo(() => {
    return blockNode
      ? BlockManager.getBlockByType(
          getNodeTypeFromClassName(blockNode.classList)!,
        )
      : null;
  }, [blockNode]);

  if (focusIdx === hoverIdx && !isDragging) return null;
  if (!block || !blockNode) return null;

  return (
    <>
      {createPortal(
        <IframeCacheProvider>
          <Box
            id="easy-email-extensions-InteractivePrompt-HoverTooltip"
            sx={{
              position: "absolute",
              height: "100%",
              width: "100%",
              top: 0,
              left: 0,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <TipNode
              type={isDragging ? "drag" : "hover"}
              lineWidth={1}
              title={block.name}
              direction={
                isTop && direction === "top" ? "noEnoughTop" : direction
              }
              isDragging={isDragging}
            />
          </Box>
        </IframeCacheProvider>,
        blockNode,
      )}
    </>
  );
}

interface TipNodeProps {
  title: string;
  direction?: string;
  isDragging?: boolean;
  lineWidth: number;
  type: "drag" | "hover";
}

function TipNode(props: TipNodeProps) {
  const { direction, title, lineWidth, type } = props;

  const dragTitle = useMemo(() => {
    if (direction === "top" || direction === "noEnoughTop") {
      return `${t("Insert before")} ${title}`;
    } else if (direction === "bottom") {
      return `${t("Insert after")} ${title}`;
    } else if (direction === "right" || direction === "left") {
      return t("Drag here");
    }
    return `${t("Drag to")} ${title}`;
  }, [direction, title]);

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1,
        color: "#000",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        textAlign: "left",
      }}
    >
      <style>
        {`
        .email-block {
          position: relative;
        }
      `}
      </style>

      {/* Outline */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          outlineOffset: `-${lineWidth}px`,
          outline: `${lineWidth}px solid ${HOVER_COLOR}`,
        }}
      >
        {type === "hover" && (
          <Box sx={{ position: "absolute", left: 0, top: 0 }}>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: HOVER_COLOR,
                color: "#ffffff",
                height: "22px",
                lineHeight: "22px",
                display: "inline-flex",
                padding: "1px 5px",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
                transform: "translateY(-100%)",
              }}
            >
              {title}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Drag direction tip */}
      {props.isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            ...directionImage[props.direction || "none"],
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              color: "#ffffff",
              backgroundColor: HOVER_COLOR,
              lineHeight: "22px",
              display: "inline-flex",
              maxWidth: "100%",
              textAlign: "center",
              whiteSpace: "nowrap",
              ...positionStyleMap[props.direction || "none"],
            }}
          >
            {dragTitle}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

const positionStyleMap: Record<string, any> = {
  noEnoughTop: {
    top: "0%",
    left: "50%",
    padding: "1px 5px",
    transform: "translate(-50%, 0%)",
  },
  top: {
    top: "0%",
    left: "50%",
    padding: "1px 5px",
    transform: "translate(-50%, -50%)",
  },
  bottom: {
    top: "100%",
    left: "50%",
    padding: "1px 5px",
    transform: "translate(-50%, -50%)",
  },
  left: {
    top: "50%",
    left: "0%",
    padding: "5px 1px",
    writingMode: "vertical-lr",
    transform: "translate(0, -50%)",
  },
  right: {
    top: "50%",
    right: "0%",
    padding: "5px 1px",
    writingMode: "vertical-lr",
    transform: "translate(0, -50%)",
  },
  none: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
};

const directionImage: Record<string, any> = {
  top: {
    backgroundImage: `linear-gradient(to bottom, ${HOVER_COLOR} 3px, transparent 3px)`,
  },
  bottom: {
    backgroundImage: `linear-gradient(to top, ${HOVER_COLOR} 3px, transparent 3px)`,
  },
  left: {
    backgroundImage: `linear-gradient(to right, ${HOVER_COLOR} 3px, transparent 3px)`,
  },
  right: {
    backgroundImage: `linear-gradient(to left, ${HOVER_COLOR} 3px, transparent 3px)`,
  },
  none: {},
};
