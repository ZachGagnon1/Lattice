import React, { useMemo, useState } from "react";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { Box, Button, Divider } from "@mui/material";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { RuleBuilderModal } from "./RuleBuilderModal";
import { IConditionGroup, compileCondition } from "@/domain/compile/handlebars";
import { Text } from "@/adapters/ui/kit/Text";

/** The root group of a block that has no rules yet. */
const EMPTY_TREE: IConditionGroup = { logicalOperator: "AND", rules: [] };

export function Condition() {
  const { focusIdx } = useFocusIdx();
  const { input } = useEditorField<IConditionGroup>(
    `${focusIdx}.data.value.rulesTree`,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // A new block on the canvas has no rules tree, so the modal gets a root group.
  const currentData: IConditionGroup = input.value || EMPTY_TREE;

  // The compiler already walks the tree, so the summary reads its count.
  // A second walk is not necessary.
  const totalRules = useMemo(
    () => compileCondition(currentData).ruleCount,
    [currentData],
  );

  return (
    <AttributesPanelWrapper>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Text size="sm" weight="bold" mb={1}>
            Display Conditions
          </Text>
          <Divider />
        </Box>

        {/* Status Summary Box */}
        <Box
          sx={{
            textAlign: "center",
            py: 3,
            px: 2,
            bgcolor: totalRules > 0 ? "primary.50" : "grey.100",
            borderRadius: 2,
            border: "1px solid",
            borderColor: totalRules > 0 ? "primary.200" : "grey.300",
          }}
        >
          <Text size="sm" tone={totalRules > 0 ? "primary" : "muted"}>
            {totalRules === 0
              ? "No conditions set. The contents of this block will always be visible."
              : `Active: ${totalRules} condition(s) configured.`}
          </Text>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          disableElevation
          onClick={() => setIsModalOpen(true)}
        >
          {totalRules > 0 ? "Edit Logic Rules" : "Add Logic Rules"}
        </Button>
      </Box>

      {/* The full-screen builder modal */}
      <RuleBuilderModal
        open={isModalOpen}
        initialData={currentData}
        onClose={() => setIsModalOpen(false)}
        onSave={(newRulesTree) => {
          input.onChange(newRulesTree); // Save the AST directly back to the block's data
          setIsModalOpen(false);
        }}
      />
    </AttributesPanelWrapper>
  );
}
