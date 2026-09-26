import React from "react";
import { ToolItem } from "../../ToolItem";
import { ColorCommandWrapper } from "@/adapters/panels/common/Form/RichTextToolBar/components/ColorChanger/ColorCommandWrapper";
import FontDownloadIcon from "@mui/icons-material/FontDownload";

export function IconBgColor({
  selectionRange,
  execCommand,
}: Readonly<{
  selectionRange: Range | null;
  execCommand: (cmd: string, val?: any) => void;
}>) {
  return (
    <ColorCommandWrapper
      command="hiliteColor"
      selectionRange={selectionRange}
      execCommand={execCommand}
      styleKey="backgroundColor"
    >
      {(color) => (
        <ToolItem
          icon={
            <div style={{ position: "relative" }}>
              <FontDownloadIcon
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
          title="Background color"
        />
      )}
    </ColorCommandWrapper>
  );
}
