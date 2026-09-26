import React, { useMemo, useState } from "react";
import { useEditorField } from "@/extensions/components/Form/useEditorField";
import { Box, Button, Divider, Typography } from "@mui/material";
import { AttributesPanelWrapper } from "@/extensions/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { RuleBuilderModal } from "./RuleBuilderModal";
import { IConditionGroup, compileCondition } from "@/core/utils/handlebars";

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
