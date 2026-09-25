import React, { useMemo } from "react";
import { useField } from "react-final-form";
import {
  Alert,
  Box,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AttributesPanelWrapper } from "@/extensions/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { MergeTags } from "@/extensions/AttributePanel/components/attributes/MergeTags";
import {
  ILoopConfig,
  LOOP_CLOSE,
  compileLoopIssues,
  compileLoopLabel,
  compileLoopOpen,
} from "@/core/utils/handlebars";

export function ForLoop() {
  const { focusIdx } = useFocusIdx();
  const { input: sourceInput } = useField<string>(
    `${focusIdx}.data.value.dataSource`,
    {
      subscription: { value: true },
    },
  );
  const { input: itemAsInput } = useField<string>(
    `${focusIdx}.data.value.itemAs`,
    {
      subscription: { value: true },
    },
  );

  // The block stores `dataSource`, but the shared compiler takes `source`.
  // A rename of the stored field breaks saved templates.
  const loopConfig: ILoopConfig = useMemo(
    () => ({ source: sourceInput.value, itemAs: itemAsInput.value }),
    [sourceInput.value, itemAsInput.value],
  );

  const loopOpen = compileLoopOpen(loopConfig);
  const issues = compileLoopIssues(loopConfig);

  const hasSource = loopOpen !== null;
  const hasAlias = String(itemAsInput.value ?? "").trim() !== "";

  // An empty source and an empty alias mean that the loop is not configured.
  // The status card already reports that state, so the warning stays quiet.
  const isLoopStarted = Boolean(sourceInput.value) || hasAlias;

  return (
    <AttributesPanelWrapper>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold" }}
            gutterBottom
          >
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
              ? "This block repeats its contents for each item."
              : "No data source set. Contents will render without a loop."}
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Data Source (array merge tag)
            </Typography>
            <MergeTags
              isSelect
              rawPath
              arraysOnly
              value={sourceInput.value}
              onChange={sourceInput.onChange}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
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

        {isLoopStarted && issues.length > 0 && (
          <Alert severity="warning" variant="outlined" sx={{ py: 0.5 }}>
            {issues.map((issue) => (
              <Typography
                key={`${issue.path}-${issue.code}`}
                variant="body2"
                component="div"
              >
                {issue.message}
              </Typography>
            ))}
          </Alert>
        )}

        {hasSource && !hasAlias && (
          <Typography variant="caption" color="text.secondary">
            {"With no alias, fields insert as {{this.field}}. " +
              "An alias is clearer, especially inside a nested loop."}
          </Typography>
        )}

        {loopOpen !== null && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              {compileLoopLabel(loopConfig)}
            </Typography>
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
              <code>{`${loopOpen}...${LOOP_CLOSE}`}</code>
            </Box>
          </Box>
        )}
      </Box>
    </AttributesPanelWrapper>
  );
}
