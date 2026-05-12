import React from "react";
import { useField } from "react-final-form";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { MergeTags } from "@/extensions/AttributePanel/components/attributes/MergeTags";
import { ComparisonOperator, LogicalOperator } from "./types";

export interface FilterRuleProps {
  name: string;
  index: number;
  onRemove: () => void;
}

export function FilterRule(props: Readonly<FilterRuleProps>) {
  const { name, index, onRemove } = props;

  const { input: fieldInput } = useField<string>(`${name}.fieldId`);
  const { input: comparisonInput } = useField<ComparisonOperator | "">(
    `${name}.comparisonOperator`,
  );
  const { input: valueInput } = useField<string>(`${name}.value`);
  const { input: logicalOperatorInput } = useField<LogicalOperator>(
    `${name}.logicalOperator`,
  );

  // Determine if the current comparison operator doesn't require a value
  const isValueHidden =
    comparisonInput.value === "IS_EMPTY" ||
    comparisonInput.value === "IS_NOT_EMPTY";

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: "100%", alignItems: "center" }}
    >
      {/* Logical Operator (AND/OR) */}
      {index > 0 ? (
        <Select {...logicalOperatorInput} size="small" sx={{ width: 90 }}>
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
        </Select>
      ) : (
        <Box sx={{ width: 90 }} />
      )}

      {/* Field Selector */}
      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <MergeTags
          isSelect
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
        <MenuItem value="EQUALS">Equals</MenuItem>
        <MenuItem value="NOT_EQUALS">Not Equals</MenuItem>
        <MenuItem value="CONTAINS">Contains</MenuItem>
        <MenuItem value="GREATER_THAN">Greater Than</MenuItem>
        <MenuItem value="LESS_THAN">Less Than</MenuItem>
        <MenuItem value="IS_EMPTY">Is Empty</MenuItem>
        <MenuItem value="IS_NOT_EMPTY">Is Not Empty</MenuItem>
      </Select>

      {/* Value Input (Conditionally Rendered) */}
      {isValueHidden ? (
        // Render an empty box with the same flexGrow to prevent the UI from collapsing or shifting
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
