import React from "react";
import { Form } from "react-final-form";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FilterRuleGroup } from "./FilterRuleGroup";
import { IConditionGroupNode } from "./types"; // Adjust path

export interface RuleBuilderModalProps {
  open: boolean;
  initialData: IConditionGroupNode;
  onClose: () => void;
  onSave: (data: IConditionGroupNode) => void;
}

export function RuleBuilderModal(props: Readonly<RuleBuilderModalProps>) {
  const { open, initialData, onClose, onSave } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Logic Rules</DialogTitle>

      <Form
        initialValues={{ rulesTree: initialData }}
        onSubmit={(values) => onSave(values.rulesTree)}
        render={({ handleSubmit }) => (
          // The form tag is required to natively handle the submit event from DialogActions
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <DialogContent dividers sx={{ p: 3, bgcolor: "grey.50" }}>
              <Box sx={{ minHeight: 300 }}>
                {/* The Root Rule Group starts at nesting level 0 */}
                <FilterRuleGroup name="rulesTree" nestingLevel={0} index={0} />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Logic
              </Button>
            </DialogActions>
          </form>
        )}
      />
    </Dialog>
  );
}
