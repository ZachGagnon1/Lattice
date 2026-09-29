import React from "react";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { MergeTags } from "@/adapters/panels/AttributePanel/components/attributes/MergeTags";
import {
  COMPARISON_OPERATORS,
  ComparisonOperator,
  LogicalOperator,
  OPERATORS_WITHOUT_VALUE,
  OPERATOR_LABELS,
  ConditionIssue,
} from "@/domain/compile/handlebars";
import {
  getIssueControl,
  getRuleControlId,
  getRuleLabel,
  getRulePath,
} from "@/shared/utils/conditionAccessibility";

/** The width of the connector column. Each row reserves it, so no row shifts. */
const CONNECTOR_WIDTH = 90;

export interface RuleConnectorProps {
  /** The field name of the GROUP that owns this row, such as `rulesTree`. */
  groupName: string;
  index: number;
}

/**
 * Renders the AND/OR connector in front of one row of a group.
 *
 * One operator joins all children of a group, so only the second row holds
 * the editable `<Select>`. Later rows show the operator as static text.
 * The first row holds a spacer of the same width.
 */
export function RuleConnector(props: Readonly<RuleConnectorProps>) {
  const { groupName, index } = props;

  // Bind the GROUP operator, not the row operator. The compiler reads only the
  // group operator. A per-row field shows a value that never reaches the output.
  const { input } = useEditorField<LogicalOperator>(
    `${groupName}.logicalOperator`,
  );
  const operator: LogicalOperator = input.value === "OR" ? "OR" : "AND";

  if (index === 0) {
    return <Box sx={{ width: CONNECTOR_WIDTH, flexShrink: 0 }} />;
  }

  if (index === 1) {
    const operatorId = getRuleControlId(groupName, "operator");
    const groupLabel = `${getRuleLabel(groupName)} connector`;
    return (
      <FormControl size="small" sx={{ width: CONNECTOR_WIDTH, flexShrink: 0 }}>
        <InputLabel id={`${operatorId}-label`}>{groupLabel}</InputLabel>
        <Select
          {...input}
          id={operatorId}
          labelId={`${operatorId}-label`}
          label={groupLabel}
          value={operator}
        >
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <Box
      sx={{
        width: CONNECTOR_WIDTH,
        flexShrink: 0,
        textAlign: "center",
        py: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {operator}
      </Typography>
    </Box>
  );
}

export interface FilterRuleProps {
  /** The field name of this rule, such as `rulesTree.rules[0]`. */
  name: string;
  groupName: string;
  index: number;
  onRemove: () => void;
  issues?: ConditionIssue[];
}

export function FilterRule(props: Readonly<FilterRuleProps>) {
  const { name, groupName, index, onRemove, issues = [] } = props;

  const { input: fieldInput } = useEditorField<string>(`${name}.fieldId`);
  const { input: comparisonInput } = useEditorField<ComparisonOperator | "">(
    `${name}.comparisonOperator`,
  );
  const { input: valueInput } = useEditorField<string>(`${name}.value`);

  // `IS_EMPTY` and `IS_NOT_EMPTY` take no right-hand value. The compiler owns
  // that list. The panel reads it, not a copy.
  const isValueHidden = (OPERATORS_WITHOUT_VALUE as readonly string[]).includes(
    comparisonInput.value,
  );
  const ruleLabel = getRuleLabel(name);
  const ruleIssue = issues.find((issue) => issue.path === getRulePath(name));
  const invalidControl = ruleIssue ? getIssueControl(ruleIssue) : undefined;
  const errorId = ruleIssue
    ? `${getRuleControlId(name, invalidControl!)}-error`
    : undefined;
  const fieldId = getRuleControlId(name, "field");
  const operatorId = getRuleControlId(name, "operator");
  const valueId = getRuleControlId(name, "value");

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: "100%", alignItems: "center" }}
    >
      <RuleConnector groupName={groupName} index={index} />

      {/* Field Selector */}
      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <MergeTags
          id={fieldId}
          label={`${ruleLabel} field`}
          error={invalidControl === "field"}
          describedBy={invalidControl === "field" ? errorId : undefined}
          isSelect
          rawPath
          value={fieldInput.value}
          onChange={fieldInput.onChange}
        />
      </Box>

      {/* Comparison Operator */}
      <FormControl
        size="small"
        error={invalidControl === "operator"}
        sx={{ flexGrow: 1, minWidth: 150 }}
      >
        <InputLabel
          id={`${operatorId}-label`}
        >{`${ruleLabel} operator`}</InputLabel>
        <Select
          {...comparisonInput}
          id={operatorId}
          labelId={`${operatorId}-label`}
          label={`${ruleLabel} operator`}
          aria-describedby={invalidControl === "operator" ? errorId : undefined}
        >
          {COMPARISON_OPERATORS.map((operator) => (
            <MenuItem key={operator} value={operator}>
              {OPERATOR_LABELS[operator]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Value input */}
      {isValueHidden ? (
        // An empty box keeps the layout stable.
        <Box sx={{ flexGrow: 2 }} />
      ) : (
        <TextField
          id={valueId}
          label={`${ruleLabel} value`}
          error={invalidControl === "value"}
          aria-describedby={invalidControl === "value" ? errorId : undefined}
          {...valueInput}
          size="small"
          sx={{ flexGrow: 2 }}
        />
      )}

      {/* Remove Button */}
      <IconButton
        aria-label={`Remove ${ruleLabel}`}
        onClick={onRemove}
        color="error"
        size="small"
      >
        <HighlightOffIcon aria-hidden="true" />
      </IconButton>
      {ruleIssue && (
        <Box id={errorId} sx={{ position: "absolute", clip: "rect(0 0 0 0)" }}>
          {ruleIssue.message}
        </Box>
      )}
    </Stack>
  );
}
