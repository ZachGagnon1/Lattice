import React from "react";
import ReactDOM from "react-dom";
import { getIframeDocument, useBlock, useEditorContext, useFocusIdx } from "@";
import { RichTextField } from "../common/Form/RichTextField";
import { PresetColorsProvider } from "./components/provider/PresetColorsProvider";
import { BlockAttributeConfigurationManager } from "./utils/BlockAttributeConfigurationManager";
import { SelectionRangeProvider } from "./components/provider/SelectionRangeProvider";
import { TableOperation } from "./components/blocks/Table/Operation";
import { BlockSettings } from "./components/BlockSettings";
import { getBlockTitle } from "@/shared/utils/panel/getBlockTitle";
// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { getHeadingComponent } from "@/shared/utils/accessibility";
import { INLINE_EDIT_INSTRUCTIONS_ID } from "@/shared/utils/inlineEditAccessibility";

export interface AttributePanelProps {}

export function AttributePanel() {
  const { values, focusBlock } = useBlock();
  const { initialized } = useEditorContext();
  const { headingLevel = 2 } = useEditorProps();

  const { focusIdx } = useFocusIdx();

  const Com =
    focusBlock && BlockAttributeConfigurationManager.get(focusBlock.type);

  const iframeDocument = getIframeDocument();

  if (!initialized) return null;

  return (
    <SelectionRangeProvider>
      <PresetColorsProvider>
        {Com ? (
          <BlockSettings
            label={`${getBlockTitle(focusBlock, false)} ${t("settings")}`}
          >
            <Com key={focusIdx} />
          </BlockSettings>
        ) : (
          <Box sx={{ mt: "200px", px: "50px", textAlign: "center" }}>
            <Typography
              component={getHeadingComponent(headingLevel)}
              variant="h6"
              color="text.secondary"
            >
              {t("No matching components")}
            </Typography>
          </Box>
        )}
        <Box sx={{ position: "absolute" }}>
          <RichTextField />
        </Box>
        <TableOperation />
        <>
          {iframeDocument?.body &&
            ReactDOM.createPortal(
              <>
                <div
                  id={INLINE_EDIT_INSTRUCTIONS_ID}
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                >
                  {t(
                    "Edit this content directly. Press Alt+F10 to move to the text formatting toolbar. On a Mac, press Fn+Option+F10. Press Escape or Tab to return to the text block. Press Alt+Enter to go to the block settings. On a Mac, press Option+Enter.",
                  )}
                </div>
                <style>{`
              .email-block [contentEditable="true"],
              .email-block [contentEditable="true"] * {
                cursor: text;
              }
              .email-block [contentEditable="true"]:focus {
                outline: none !important;
              }
              `}</style>
              </>,
              iframeDocument?.body as any,
            )}
        </>
      </PresetColorsProvider>
    </SelectionRangeProvider>
  );
}
