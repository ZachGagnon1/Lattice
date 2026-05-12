import React from "react";
import { useField } from "react-final-form";
import { Box, Button, MenuItem, Select, Stack } from "@mui/material";
import { FilterRule } from "./FilterRule";
import { IConditionGroupNode, IConditionRule, isConditionGroup, LogicalOperator } from "./types";

export interface FilterRuleGroupProps {
  name: string;
  nestingLevel: number;
  index: number;
  onRemove?: () => void;
}

export function FilterRuleGroup(props: Readonly<FilterRuleGroupProps>) {
  const { name, nestingLevel, index, onRemove } = props;

  const rulesFieldName = `${name}.rules`;
  const logicalOperatorFieldName = `${name}.logicalOperator`;

  // Bind to the group's logical operator (if it's a sub-group)
  const { input: logicalOperatorInput } = useField<LogicalOperator>(
    logicalOperatorFieldName,
  );

  // Bind to the array of rules/groups
  const { input: rulesInput } = useField<
    Array<IConditionRule | IConditionGroupNode>
  >(rulesFieldName, { subscription: { value: true } });

  const rules = rulesInput.value || [];

  const handleAddSimpleRule = (): void => {
    rulesInput.onChange([
      ...rules,
      {
        fieldId: "",
        comparisonOperator: "EQUALS",
        value: "",
        logicalOperator: "AND",
      },
    ]);
  };

  const handleAddGroup = (): void => {
    rulesInput.onChange([
      ...rules,
      {
        logicalOperator: "AND",
        rules: [
          {
            fieldId: "",
            comparisonOperator: "EQUALS",
            value: "",
            logicalOperator: "AND",
          },
        ],
      },
    ]);
  };

  const handleRemoveItem = (indexToRemove: number): void => {
    rulesInput.onChange(rules.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: "100%", alignItems: "flex-start" }}
    >
      {/* Group Level AND/OR connector */}
      {nestingLevel > 0 && index > 0 && (
        <Select {...logicalOperatorInput} size="small" sx={{ width: 90 }}>
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
        </Select>
      )}

      <Box
        sx={{
          flexGrow: 1,
          bgcolor:
            nestingLevel % 2 === 0 ? "background.paper" : "background.default",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Stack spacing={2}>
          {rules.map((rule, idx) => {
            const childFieldName = `${rulesFieldName}[${idx}]`;

            if (isConditionGroup(rule)) {
              return (
                <FilterRuleGroup
                  key={idx}
                  name={childFieldName}
                  nestingLevel={nestingLevel + 1}
                  index={idx}
                  onRemove={() => handleRemoveItem(idx)}
                />
              );
            }

            return (
              <FilterRule
                key={idx}
                name={childFieldName}
                index={idx}
                onRemove={() => handleRemoveItem(idx)}
              />
            );
          })}

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddSimpleRule}
            >
              + Add Rule
            </Button>
            <Button variant="outlined" size="small" onClick={handleAddGroup}>
              + Add Group
            </Button>
            {nestingLevel > 0 && onRemove && (
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={onRemove}
              >
                Remove Group
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
