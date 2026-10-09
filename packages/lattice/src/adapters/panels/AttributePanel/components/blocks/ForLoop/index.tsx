import React, { useMemo } from "react";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { Alert, Box, Divider, Stack, TextField } from "@mui/material";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { MergeTags } from "@/adapters/panels/AttributePanel/components/attributes/MergeTags";
import {
  ILoopConfig,
  LOOP_CLOSE,
  compileLoopIssues,
  compileLoopLabel,
  compileLoopOpen,
} from "@/domain/compile/handlebars";
import { Text } from "@/adapters/ui/kit/Text";

export function ForLoop() {
  const { focusIdx } = useFocusIdx();
  const { input: sourceInput } = useEditorField<string>(
    `${focusIdx}.data.value.dataSource`,
  );
  const { input: itemAsInput } = useEditorField<string>(
    `${focusIdx}.data.value.itemAs`,
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
          <Text size="sm" weight="bold" mb={1}>
            For Loop
          </Text>
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
          <Text size="sm" tone={hasSource ? "primary" : "muted"}>
            {hasSource
              ? "This block repeats its contents for each item."
              : "No data source set. Contents will render without a loop."}
          </Text>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Text size="xs" tone="muted" mb={1} block>
              Data Source (array merge tag)
            </Text>
            <MergeTags
              isSelect
              rawPath
              arraysOnly
              value={sourceInput.value}
              onChange={sourceInput.onChange}
            />
          </Box>

          <Box>
            <Text size="xs" tone="muted" mb={1} block>
              Item Alias (optional)
            </Text>
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
              <Text key={`${issue.path}-${issue.code}`} size="sm" as="div">
                {issue.message}
              </Text>
            ))}
          </Alert>
        )}

        {hasSource && !hasAlias && (
          <Text size="xs" tone="muted">
            {"With no alias, fields insert as {{this.field}}. " +
              "An alias is clearer, especially inside a nested loop."}
          </Text>
        )}

        {loopOpen !== null && (
          <Box>
            <Text size="xs" tone="muted" mb={1} block>
              {compileLoopLabel(loopConfig)}
            </Text>
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
