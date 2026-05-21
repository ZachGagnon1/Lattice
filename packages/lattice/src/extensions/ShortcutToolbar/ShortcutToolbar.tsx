import { BasicType, IButton, IImage, Stack } from "@";
import React, { useRef } from "react";
import { BlocksPanel } from "./components/BlocksPanel";
import { DragIcon } from "./components/DragIcon";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@mui/material";

export function ShortcutToolbar() {
  const blocksPanelRef = useRef<HTMLDivElement>(null);

  return (
    <Stack vertical alignment="center" distribution="center">
      <BlocksPanel>
        <div ref={blocksPanelRef} />
      </BlocksPanel>
      <DragIcon
        type={BasicType.TEXT}
        color="rgb(110, 215, 135)"
        payload={{
          attributes: { padding: "0px 25px 0px 25px", align: "center" },
        }}
      />
      <DragIcon<IImage>
        payload={{ attributes: { padding: "0px 0px 0px 0px" } }}
        type={BasicType.IMAGE}
        color="rgb(250, 208, 97)"
      />
      <DragIcon<IButton> type={BasicType.BUTTON} color="rgb(238,144,172)" />
      <DragIcon type={BasicType.SOCIAL} color="rgb(111,206,236) " />
      <DragIcon type={BasicType.NAVBAR} color="rgb(191,24,84)" />
      <DragIcon type={BasicType.DIVIDER} color="rgb(71,67,239)" />
      <DragIcon type={BasicType.SPACER} color="#ccc" />
      <DragIcon
        color="rgb(24,201,137)"
        payload={{
          children: [
            {
              type: BasicType.COLUMN,
              data: {
                value: {},
              },
              attributes: {
                padding: "0px 0px 0px 0px",
                border: "none",
                "vertical-align": "top",
              },
              children: [],
            },
            {
              type: BasicType.COLUMN,
              data: {
                value: {},
              },
              attributes: {
                padding: "0px 0px 0px 0px",
                border: "none",
                "vertical-align": "top",
              },
              children: [],
            },
          ],
        }}
        type={BasicType.SECTION}
      />

      <IconButton
        aria-label="view-more"
        onClick={() => blocksPanelRef.current?.click()}
      >
        <MoreHorizIcon
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            color: "var(--color-text-2)",
            boxShadow: "0 0 12px -3px var(--color-text-2)",
            fontSize: 18,
          }}
        />
      </IconButton>
    </Stack>
  );
}
