import React, { useMemo, useState } from "react";
import { useField } from "react-final-form";
import { Box, Button, Divider, Typography } from "@mui/material";
import { AttributesPanelWrapper } from "@/extensions/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { RuleBuilderModal } from "./RuleBuilderModal";
import { IConditionGroupNode, isConditionGroup } from "./types";

// Helper to recursively count total individual rules in the AST
const countTotalRules = (node: IConditionGroupNode): number => {
  let count = 0;
  if (!node?.rules) return count;

  node.rules.forEach((rule) => {
    if (isConditionGroup(rule)) {
      count += countTotalRules(rule);
    } else {
      count += 1;
    }
  });
  return count;
};

export function Condition() {
  const { focusIdx } = useFocusIdx();
  const { input } = useField<IConditionGroupNode>(`${focusIdx}.data.value.rulesTree`, {
    subscription: { value: true },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Guarantee we always have a valid root group to pass to the modal,
  // even if the block was just dragged onto the canvas.
  const currentData: IConditionGroupNode = input.value || {
    logicalOperator: "AND",
    rules: [],
  };

  // Calculate rule count for the summary UI
  const totalRules = useMemo(() => countTotalRules(currentData), [currentData]);

  return (
    <AttributesPanelWrapper>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
            }}
            gutterBottom
          >
            Display Conditions
          </Typography>
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
          <Typography
            variant="body2"
            color={totalRules > 0 ? "primary.main" : "text.secondary"}
          >
            {totalRules === 0
              ? "No conditions set. The contents of this block will always be visible."
              : `Active: ${totalRules} condition(s) configured.`}
          </Typography>
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
