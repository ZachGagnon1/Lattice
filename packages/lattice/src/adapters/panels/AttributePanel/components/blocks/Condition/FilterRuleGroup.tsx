import React from "react";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { Box, Button, Stack } from "@mui/material";
import { FilterRule, RuleConnector } from "./FilterRule";
import {
  IConditionGroup,
  IConditionRule,
  isConditionGroup,
} from "@/domain/compile/handlebars";

/** Builds a new rule. A rule has no logical operator. */
const createRule = (): IConditionRule => ({
  fieldId: "",
  comparisonOperator: "EQUALS",
  value: "",
});

/** Builds a new group. Only a group has a logical operator. */
const createGroup = (): IConditionGroup => ({
  logicalOperator: "AND",
  rules: [createRule()],
});

export interface FilterRuleGroupProps {
  /** The field name of this group. Example: `rulesTree.rules[1]`. */
  name: string;
  /**
   * The field name of the parent group.
   * The root group has no parent. It omits this field and shows no connector.
   */
  groupName?: string;
  nestingLevel: number;
  index: number;
  onRemove?: () => void;
}

export function FilterRuleGroup(props: Readonly<FilterRuleGroupProps>) {
  const { name, groupName, nestingLevel, index, onRemove } = props;

  const rulesFieldName = `${name}.rules`;

  const { input: rulesInput } =
    useEditorField<Array<IConditionRule | IConditionGroup>>(rulesFieldName);

  const rules = rulesInput.value || [];

  const handleAddSimpleRule = (): void => {
    rulesInput.onChange([...rules, createRule()]);
  };

  const handleAddGroup = (): void => {
    rulesInput.onChange([...rules, createGroup()]);
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
      {/* The connector belongs to the PARENT group, so it binds the parent
          operator. A nested group is one row of its parent, the same as a
          rule. The root group has no parent and shows nothing. */}
      {groupName && <RuleConnector groupName={groupName} index={index} />}

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
                  groupName={name}
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
                groupName={name}
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
