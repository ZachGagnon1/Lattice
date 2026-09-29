import React from "react";
import { ToolItem } from "../../ToolItem";
import { ColorCommandWrapper } from "@/adapters/panels/common/Form/RichTextToolBar/components/ColorChanger/ColorCommandWrapper";
import FontDownloadOutlinedIcon from "@mui/icons-material/FontDownloadOutlined";

export function IconFontColor({
  selectionRange,
  execCommand,
}: Readonly<{
  selectionRange: Range | null;
  execCommand: (cmd: string, val?: any) => void;
}>) {
  return (
    <ColorCommandWrapper
      command="foreColor"
      selectionRange={selectionRange}
      execCommand={execCommand}
      styleKey="color"
    >
      {(color) => (
        <ToolItem
          icon={
            <div style={{ position: "relative" }}>
              <FontDownloadOutlinedIcon
                sx={{ position: "relative", top: "-1px", fontSize: 15 }}
              />
              <div
                style={{
                  borderBottom: `2px solid ${color || "currentColor"}`,
                  position: "absolute",
                  width: "130%",
                  left: "-15%",
                  top: 16,
                }}
              />
            </div>
          }
          title="Text color"
        />
      )}
    </ColorCommandWrapper>
  );
}
