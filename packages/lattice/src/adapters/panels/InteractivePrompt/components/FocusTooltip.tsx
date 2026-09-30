import React from "react";
import { createPortal } from "react-dom";

import {
  BasicType,
  BlockAvatarWrapper,
  useBlock,
  useFocusBlockLayout,
  useFocusIdx,
} from "@";
import { Toolbar } from "./Toolbar";
import DragHandleIcon from "@mui/icons-material/DragHandle"; // MUI Components
import Box from "@mui/material/Box";
import { IframeCacheProvider } from "@/adapters/ui/Provider/IframeCacheProvider";

const SELECTED_COLOR = "#1890ff";

export function FocusTooltip() {
  const { focusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { focusBlockNode } = useFocusBlockLayout();
  const isPage = focusBlock?.type === BasicType.PAGE;

  if (!focusBlockNode || !focusBlock) return null;

  return (
    <>
      {createPortal(
        <IframeCacheProvider>
          <Box
            id="easy-email-extensions-InteractivePrompt-FocusTooltip"
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              left: 0,
              top: 0,
              zIndex: 1,
            }}
          >
            <style>
              {`
                .email-block {
                  position: relative;
                }
              `}
            </style>

            {/* Drag Handle Container */}
            <Box
              sx={{
                position: "absolute",
                zIndex: 9999,
                right: 0,
                top: "50%",
                // Fix: 50% on the X-axis pushes it exactly halfway outside the border
                transform: "translate(50%, -50%)",
                display: isPage ? "none" : "flex",
                pointerEvents: "auto", // Ensure the whole container captures clicks/drags
              }}
              style={{
                cursor: "grab !important",
              }}
            >
              <BlockAvatarWrapper
                idx={focusIdx}
                type={focusBlock.type}
                action="move"
              >
                <div
                  style={
                    {
                      backgroundColor: SELECTED_COLOR,
                      color: "#ffffff",
                      height: "28px",
                      width: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      cursor: "grab !important",
                      pointerEvents: "auto",
                      WebkitUserDrag: "element",
                      "&:active": {
                        cursor: "grabbing !important",
                      },
                    } as any
                  }
                >
                  <DragHandleIcon
                    sx={{
                      cursor: "grab !important",
                      color: "#ffffff",
                      fontSize: 20,
                      "&:active": {
                        cursor: "grabbing !important",
                      },
                    }}
                  />
                </div>
              </BlockAvatarWrapper>
            </Box>

            {/* Outline */}
            <Box
              sx={{
                position: "absolute",
                fontSize: 14,
                zIndex: 2,
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                outlineOffset: "-2px",
                outline: `2px solid ${SELECTED_COLOR}`,
              }}
            />

            {/* Toolbar Container */}
            <Box
              sx={{
                position: "absolute",
                fontSize: 14,
                zIndex: 3,
                left: 0,
                top: 0,
                width: "0%",
                height: "100%",
              }}
            >
              <Toolbar />
            </Box>
          </Box>
        </IframeCacheProvider>,
        focusBlockNode,
      )}
    </>
  );
}
