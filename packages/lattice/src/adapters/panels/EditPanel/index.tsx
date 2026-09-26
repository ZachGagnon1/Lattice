import React from "react";
import { Box } from "@mui/material";
import { useEditorProps } from "@";
import { Blocks } from "./Blocks";
import { BlockLayer } from "@/adapters/panels/BlockLayer";
import { FullHeightOverlayScrollbars } from "@/adapters/panels/common/FullHeightOverlayScrollbars";
import { useExtensionProps } from "@/adapters/panels/common/Providers/ExtensionProvider";
// Adjust import path to where you placed the components
import {
  EditorTab,
  EditorTabPanel,
  EditorTabs,
} from "@/adapters/panels/common/EditorTabs/EditorTabs";

export function EditPanel() {
  const { height } = useEditorProps();
  const { showBlockLayer = true } = useExtensionProps();
  const [value, setValue] = React.useState("block");

  return (
    <Box
      sx={{
        padding: 0,
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <EditorTabs
        value={value}
        onChange={(_, newValue: string) => setValue(newValue)}
      >
        <EditorTab label={t("Block")} value="block" />
        {showBlockLayer && <EditorTab label={t("Layer")} value="layer" />}
      </EditorTabs>

      <EditorTabPanel value={value} index="block" destroyOnHide={false}>
        <FullHeightOverlayScrollbars height={`calc(${height} - 60px)`}>
          <Blocks />
        </FullHeightOverlayScrollbars>
      </EditorTabPanel>

      {showBlockLayer && (
        <EditorTabPanel value={value} index="layer" destroyOnHide={false}>
          <FullHeightOverlayScrollbars height={`calc(${height} - 60px)`}>
            <div style={{ padding: 20 }}>
              <BlockLayer />
            </div>
          </FullHeightOverlayScrollbars>
        </EditorTabPanel>
      )}
    </Box>
  );
}
