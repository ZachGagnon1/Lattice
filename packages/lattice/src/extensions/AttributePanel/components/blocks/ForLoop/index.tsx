import React from "react";
import { useField } from "react-final-form";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { AttributesPanelWrapper } from "@/extensions/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";

export function ForLoop() {
  const { focusIdx } = useFocusIdx();
  const { input: sourceInput } = useField<string>(`${focusIdx}.data.value.dataSource`, {
    subscription: { value: true },
  });
  const { input: itemAsInput } = useField<string>(`${focusIdx}.data.value.itemAs`, {
    subscription: { value: true },
  });

  const hasSource = Boolean(sourceInput.value);

  return (
    <AttributesPanelWrapper>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }} gutterBottom>
            For Loop
          </Typography>
          <Divider />
        </Box>

        <Box
          sx={{
            textAlign: "center",
            py: 3,
            px: 2,
            bgcolor: hasSource ? "primary.50" : "grey.100",
            borderRadius: 2,
            border: "1px solid",
            borderColor: hasSource ? "primary.200" : "grey.300",
          }}
        >
          <Typography
            variant="body2"
            color={hasSource ? "primary.main" : "text.secondary"}
          >
            {hasSource
              ? `Looping over "${sourceInput.value}"${itemAsInput.value ? ` as "${itemAsInput.value}"` : ""}`
              : "No data source set. Contents will render without a loop."}
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Data Source (array variable)
            </Typography>
            <TextField
              {...sourceInput}
              size="small"
              fullWidth
              placeholder="e.g. products"
              helperText="The Handlebars path to the array you want to iterate over."
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
              placeholder="e.g. product"
              helperText='Name for the current item inside the loop. Leave blank to use "this".'
            />
          </Box>
        </Stack>

        {hasSource && (
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
            }}
          >
            <code>
              {`{{#each ${sourceInput.value}${itemAsInput.value ? ` as |${itemAsInput.value}|` : ""}}}...{{/each}}`}
            </code>
          </Box>
        )}
      </Box>
    </AttributesPanelWrapper>
  );
}
