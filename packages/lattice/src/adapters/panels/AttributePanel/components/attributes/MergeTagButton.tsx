import React, { useId, useState } from "react";
import { Box, IconButton, InputAdornment, Popover } from "@mui/material";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { MergeTags } from "./MergeTags";

/** An end adornment for a text field. A button in the field label would also render in the hidden outline legend. */
export function MergeTagButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const popoverId = useId();
  const open = Boolean(anchorEl);

  return (
    <InputAdornment position="end">
      <IconButton
        aria-label={t("Insert merge tag")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        edge="end"
      >
        <DataObjectIcon />
      </IconButton>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { role: "dialog", "aria-label": t("Merge tags") },
        }}
      >
        <Box sx={{ p: 1 }}>
          <MergeTags value={value} onChange={onChange} />
        </Box>
      </Popover>
    </InputAdornment>
  );
}
