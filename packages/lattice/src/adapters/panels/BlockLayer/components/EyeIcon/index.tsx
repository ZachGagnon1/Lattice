import { BasicType, IBlockDataWithId } from "@";
import React from "react";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export function EyeIcon({
  blockData,
  hidden,
  onToggleVisible,
}: Readonly<{
  blockData: IBlockDataWithId;
  hidden?: boolean;
  onToggleVisible: (blockData: IBlockDataWithId, ev: React.MouseEvent) => void;
}>) {
  if (hidden)
    return (
      <div style={{ visibility: "hidden" }}>
        <VisibilityIcon />
      </div>
    );
  if (blockData.type === BasicType.PAGE) return null;

  return blockData.data.hidden ? (
    <IconButton
      aria-label="Make Block Visible"
      onClick={(ev) => onToggleVisible(blockData, ev)}
    >
      <VisibilityIcon />
    </IconButton>
  ) : (
    <IconButton
      aria-label="Hide Block"
      onClick={(ev) => onToggleVisible(blockData, ev)}
    >
      <VisibilityOffIcon />
    </IconButton>
  );
}
