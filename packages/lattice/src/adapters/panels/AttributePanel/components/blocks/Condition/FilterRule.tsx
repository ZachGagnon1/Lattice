import React from "react";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import {
  Box,
  IconButton,
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
} from "@/domain/compile/handlebars";

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
    return (
      <Select
        {...input}
        value={operator}
        size="small"
        sx={{ width: CONNECTOR_WIDTH, flexShrink: 0 }}
      >
        <MenuItem value="AND">AND</MenuItem>
        <MenuItem value="OR">OR</MenuItem>
      </Select>
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
}

export function FilterRule(props: Readonly<FilterRuleProps>) {
  const { name, groupName, index, onRemove } = props;

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
          isSelect
          rawPath
          value={fieldInput.value}
          onChange={fieldInput.onChange}
        />
      </Box>

      {/* Comparison Operator */}
      <Select
        {...comparisonInput}
        size="small"
        sx={{ flexGrow: 1, minWidth: 150 }}
      >
        {COMPARISON_OPERATORS.map((operator) => (
          <MenuItem key={operator} value={operator}>
            {OPERATOR_LABELS[operator]}
          </MenuItem>
        ))}
      </Select>

      {/* Value input */}
      {isValueHidden ? (
        // An empty box keeps the layout stable.
        <Box sx={{ flexGrow: 2 }} />
      ) : (
        <TextField
          {...valueInput}
          size="small"
          placeholder="Value"
          sx={{ flexGrow: 2 }}
        />
      )}

      {/* Remove Button */}
      <IconButton onClick={onRemove} color="error" size="small">
        <HighlightOffIcon />
      </IconButton>
    </Stack>
  );
}
