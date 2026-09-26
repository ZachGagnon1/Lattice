import React from "react";
import {
  BlockAvatarWrapper,
  BlockManager,
  IBlockData,
  RecursivePartial,
} from "@";
import { getIconNameByBlockType } from "@/adapters/panels";
import { IconButton, Tooltip } from "@mui/material";

export interface DragIconProps<T extends IBlockData> {
  type: string;
  payload?: RecursivePartial<T>;
  color: string;
}

export function DragIcon<T extends IBlockData = any>(props: DragIconProps<T>) {
  const block = BlockManager.getBlockByType(props.type);

  return (
    <BlockAvatarWrapper type={props.type} payload={props.payload}>
      <Tooltip title={block?.name ?? ""} placement="top">
        <IconButton
          size="small"
          sx={{
            cursor: "move",
            "&:active": { cursor: "grabbing" },
          }}
        >
          {getIconNameByBlockType(props.type)}
        </IconButton>
      </Tooltip>
    </BlockAvatarWrapper>
  );
}
