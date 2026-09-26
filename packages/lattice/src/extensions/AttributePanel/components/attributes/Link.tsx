import React, { useMemo, useState } from "react";
import { useFocusIdx } from "@";
import { SelectField, TextField } from "../../../components/Form";
import { MergeTags } from "./MergeTags";
import { useEditorField } from "@/extensions/components/Form/useEditorField";
import { Box, IconButton, Popover, Stack } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import LinkIcon from "@mui/icons-material/Link";
import DataObjectIcon from "@mui/icons-material/DataObject";

export function Link() {
  const { focusIdx } = useFocusIdx();
  const { input } = useEditorField<string>(`${focusIdx}.attributes.href`);

  // MUI Popover requires local state to anchor the popup to the button
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "merge-tags-popover" : undefined;

  return useMemo(() => {
    return (
      <Stack spacing={1} direction="row">
        <TextField
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            },
          }}
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <span>{t("Href")}&nbsp;&nbsp;&nbsp;</span>
              <IconButton
                aria-describedby={id}
                onClick={handleClick}
                size="small"
                sx={{ p: 0.5 }}
              >
                <DataObjectIcon />
              </IconButton>

              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {/* Added a Box with slight padding so the MergeTags don't hit the absolute edge */}
                <Box sx={{ p: 1 }}>
                  <MergeTags value={input.value} onChange={input.onChange} />
                </Box>
              </Popover>
            </Box>
          }
          name={`${focusIdx}.attributes.href`}
        />
        <SelectField
          label={t("Target")}
          name={`${focusIdx}.attributes.target`}
          options={[
            {
              value: "",
              label: t("_self"),
            },
            {
              value: "_blank",
              label: t("_blank"),
            },
          ]}
        />
      </Stack>
    );
  }, [focusIdx, input.value, input.onChange, anchorEl, open, id]);
}
