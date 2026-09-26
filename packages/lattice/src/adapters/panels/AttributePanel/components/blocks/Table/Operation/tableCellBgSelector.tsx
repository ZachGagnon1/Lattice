import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, Stack } from "@mui/material";
import { ColorPicker } from "@/adapters/panels/common/Form/ColorPicker/ColorPickerInput";

export interface CellBackgroundSelectorProps {
  bgColorHandler: (color: string) => void;
  rootDom?: Element | null;
}

export const CellBackgroundSelector: React.FC<CellBackgroundSelectorProps> = ({
  bgColorHandler,
  rootDom,
}) => {
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    if (!rootDom) return;
    const observer = new ResizeObserver(() => setColor("#ffffff"));
    observer.observe(rootDom);
    return () => observer.disconnect();
  }, [rootDom]);

  return (
    <MenuItem
      disableRipple
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "block",
        cursor: "default",
        "&:hover": { backgroundColor: "transparent" },
        py: 1,
        px: 2,
      }}
    >
      <Box sx={{ marginBottom: 1, fontSize: 13, color: "text.primary" }}>
        Set Background Color
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <ColorPicker value={color} onChange={setColor} showInput={true} />
        </Box>
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            bgColorHandler(color);
          }}
          disableElevation
          sx={{ height: 40, minWidth: "auto", px: 2 }}
        >
          Set
        </Button>
      </Stack>
    </MenuItem>
  );
};
