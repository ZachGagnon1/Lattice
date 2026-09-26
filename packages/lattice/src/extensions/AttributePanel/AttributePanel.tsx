import React from "react";
import ReactDOM from "react-dom";
import { getIframeDocument, useBlock, useEditorContext, useFocusIdx } from "@";
import { RichTextField } from "../components/Form/RichTextField";
import { PresetColorsProvider } from "./components/provider/PresetColorsProvider";
import { BlockAttributeConfigurationManager } from "./utils/BlockAttributeConfigurationManager";
import { SelectionRangeProvider } from "./components/provider/SelectionRangeProvider";
import { TableOperation } from "./components/blocks/Table/Operation";
// MUI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface AttributePanelProps {}

export function AttributePanel() {
  const { values, focusBlock } = useBlock();
  const { initialized } = useEditorContext();

  const { focusIdx } = useFocusIdx();

  const Com =
    focusBlock && BlockAttributeConfigurationManager.get(focusBlock.type);

  const iframeDocument = getIframeDocument();

  if (!initialized) return null;

  return (
    <SelectionRangeProvider>
      <PresetColorsProvider>
        {Com ? (
          <Com key={focusIdx} />
        ) : (
          <Box sx={{ mt: "200px", px: "50px", textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
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
              <style>
                {`
              .email-block [contentEditable="true"],
              .email-block [contentEditable="true"] * {
                outline: none;
                cursor: text;
              }
              `}
              </style>,
              iframeDocument?.body as any,
            )}
        </>
      </PresetColorsProvider>
    </SelectionRangeProvider>
  );
}
