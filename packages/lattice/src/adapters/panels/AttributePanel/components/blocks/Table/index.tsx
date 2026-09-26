import React, { useMemo, useState } from "react";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel";
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
} from "@/adapters/panels";
import { HtmlEditor } from "../../UI/HtmlEditor";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { useFocusIdx } from "@";
import { MergeTags } from "@/adapters/panels/AttributePanel/components/attributes/MergeTags";
import {
  ILoopConfig,
  LOOP_CLOSE,
  compileLoopIssues,
  compileLoopLabel,
  compileLoopOpen,
} from "@/domain/compile/handlebars";

export function Table() {
  const [visible, setVisible] = useState(false);
  const { focusIdx } = useFocusIdx();

  const { input: sourceInput } = useEditorField<string>(
    `${focusIdx}.data.value.rowLoop.source`,
  );
  const { input: itemAsInput } = useEditorField<string>(
    `${focusIdx}.data.value.rowLoop.itemAs`,
  );
  const { input: headerRowsInput } = useEditorField<number>(
    `${focusIdx}.data.value.rowLoop.headerRows`,
  );

  // The field holds a row count, but the panel offers one checkbox.
  // A saved template with no value reads as 0, so the box starts clear and
  // the loop keeps every row, as the compiler does.
  const headerRowCount = Number(headerRowsInput.value ?? 0);
  const keepsHeaderRow = Number.isFinite(headerRowCount) && headerRowCount > 0;

  const loopConfig: ILoopConfig = useMemo(
    () => ({
      source: sourceInput.value,
      itemAs: itemAsInput.value,
      headerRows: keepsHeaderRow ? 1 : 0,
    }),
    [sourceInput.value, itemAsInput.value, keepsHeaderRow],
  );

  const loopOpen = compileLoopOpen(loopConfig);
  const issues = compileLoopIssues(loopConfig);

  const hasSource = loopOpen !== null;
  const hasAlias = String(itemAsInput.value ?? "").trim() !== "";

  // A row loop is optional. The warning shows only when the author starts
  // one, so a plain table shows no problem.
  const isLoopStarted = Boolean(sourceInput.value) || hasAlias;

  return (
    <AttributesPanelWrapper
      extra={
        <Tooltip title={t("Edit HTML")} placement="top">
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
            Wrap table rows in a Handlebars each loop to repeat them over an
            array.
          </Typography>
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
              placeholder="e.g. row"
              helperText='Name for each item. Leave blank to use "this".'
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={keepsHeaderRow}
                onChange={(event) =>
                  headerRowsInput.onChange(event.target.checked ? 1 : 0)
                }
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                First row is a header (do not repeat it)
              </Typography>
            }
          />

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
        </Stack>
      </CollapsableItem>

      <HtmlEditor visible={visible} setVisible={setVisible} />
    </AttributesPanelWrapper>
  );
}
