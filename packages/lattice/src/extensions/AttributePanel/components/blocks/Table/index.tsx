import React, { useState } from "react";
import { AttributesPanelWrapper } from "@/extensions/AttributePanel";
import {
  Border,
  Color,
  ContainerBackgroundColor,
  FontFamily,
  FontSize,
  FontStyle,
  Padding,
  TextAlign,
  Width,
} from "@/extensions";
import { HtmlEditor } from "../../UI/HtmlEditor";
import { CollapsableItem } from "@/extensions/components/Collapse/CollapsableItem";
import { Box, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { useField } from "react-final-form";
import { useFocusIdx } from "@";

export function Table() {
  const [visible, setVisible] = useState(false);
  const { focusIdx } = useFocusIdx();

  const { input: sourceInput } = useField<string>(`${focusIdx}.data.value.rowLoop.source`, {
    subscription: { value: true },
  });
  const { input: itemAsInput } = useField<string>(`${focusIdx}.data.value.rowLoop.itemAs`, {
    subscription: { value: true },
  });

  return (
    <AttributesPanelWrapper
      extra={
        <Tooltip title={t("Edit")} placement="top">
          <IconButton
            onClick={() => setVisible(true)}
            size="small"
            sx={{ p: 0.5 }}
          >
            <CodeIcon />
          </IconButton>
        </Tooltip>
      }
    >
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Width />
            </Box>
            <Box sx={{ flex: 1 }} />
          </Stack>
          <Padding />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Decoration")}>
        <Stack spacing={2}>
          <Color />
          <ContainerBackgroundColor />
          <Border />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Typography")}>
        <Stack spacing={2}>
          <FontFamily />
          <FontSize />
          <FontStyle />
          <TextAlign />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Row Loop")}>
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            Wrap table rows in a Handlebars each loop to repeat them over an array.
          </Typography>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Data Source (array variable)
            </Typography>
            <TextField
              {...sourceInput}
              size="small"
              fullWidth
              placeholder="e.g. rows"
              helperText="Array to iterate over."
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Item Alias (optional)
            </Typography>
            <TextField
              {...itemAsInput}
              size="small"
              fullWidth
              placeholder="e.g. row"
              helperText='Name for each item. Leave blank to use "this".'
            />
          </Box>
          {sourceInput.value && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
                fontFamily: "monospace",
                fontSize: 12,
                color: "text.secondary",
                wordBreak: "break-all",
              }}
            >
              <code>
                {`{{#each ${sourceInput.value}${itemAsInput.value ? ` as |${itemAsInput.value}|` : ""}}}...{{/each}}`}
              </code>
            </Box>
          )}
        </Stack>
      </CollapsableItem>

      <HtmlEditor visible={visible} setVisible={setVisible} />
    </AttributesPanelWrapper>
  );
}
