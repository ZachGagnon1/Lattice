import React from "react";
import { TextField } from ".";
import { useEditorField } from "./useEditorField";
import { useBlock, useFocusIdx } from "@";
import { Help } from "@/adapters/panels/AttributePanel/components/UI/Help";
import { IPage } from "@";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

export function AddFont() {
  const { focusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();

  // Safely grab the fonts from the page data
  const value: IPage["data"]["value"] = focusBlock?.data.value;
  const { input: fontsInput } = useEditorField<IPage["data"]["value"]["fonts"]>(
    `${focusIdx}.data.value.fonts`,
  );
  const fonts = fontsInput.value ?? [];

  return (
    <Box
      sx={{
        paddingBottom: "16px",
      }}
    >
      <Stack spacing={2}>
        {/* Header Section */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {t("Import font")}
            </Typography>
            <Help title={t("Points to a hosted css file")} />
          </Box>
          <Tooltip title={t("Add Font")} placement="top">
            <IconButton
              size="small"
              onClick={() =>
                fontsInput.onChange([...fonts, { name: "", href: "" }])
              }
              sx={{ bgcolor: "action.hover" }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Fonts List Section */}
        <Stack spacing={1.5}>
          {value.fonts?.map((item, index) => {
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name={`${focusIdx}.data.value.fonts.${index}.name`}
                    label={t("Name")}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name={`${focusIdx}.data.value.fonts.${index}.href`}
                    label={t("Href")}
                  />
                </Box>

                {/* mt: "28px" offsets the button down exactly where the input box is,
                        perfectly bypassing the space taken up by the TextField's label.
                      */}
                <Box sx={{ mt: "28px" }}>
                  <Tooltip title={t("Remove Font")} placement="top">
                    <IconButton
                      size="small"
                      onClick={() =>
                        fontsInput.onChange(fonts.filter((_, i) => i !== index))
                      }
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: "error.lighter",
                        },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}
