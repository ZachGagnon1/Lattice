import React, { useMemo } from "react";
import { Form } from "react-final-form";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { FilterRuleGroup } from "./FilterRuleGroup";
import {
  ConditionIssue,
  IConditionGroup,
  IConditionRule,
  compileCondition,
  isConditionGroup,
  normalizeFieldPath,
} from "@/core/utils/handlebars";

export interface RuleBuilderModalProps {
  open: boolean;
  initialData: IConditionGroup;
  onClose: () => void;
  onSave: (data: IConditionGroup) => void;
}

/** The value shape of the inner form. */
interface RuleBuilderValues {
  rulesTree: IConditionGroup;
}

/**
 * Rebuilds one leaf rule in the clean shape.
 *
 * An older panel saved the field as `{{firstName}}` and wrote a dead
 * `logicalOperator` onto each rule. Both go away here, so the next save
 * writes data that matches what the compiler reads.
 *
 * @param rule - One leaf node from the saved tree.
 * @returns A new rule. The input is never changed.
 */
const normalizeRule = (rule: IConditionRule): IConditionRule => ({
  fieldId: normalizeFieldPath(rule?.fieldId),
  comparisonOperator: rule?.comparisonOperator ?? "",
  value: rule?.value ?? "",
});

/**
 * Rebuilds one group and every node below it.
 *
 * @param group - One group node from the saved tree.
 * @returns A new group. The input is never changed.
 */
const normalizeGroup = (group: IConditionGroup): IConditionGroup => ({
  logicalOperator: group?.logicalOperator === "OR" ? "OR" : "AND",
  rules: (Array.isArray(group?.rules) ? group.rules : []).map((node) =>
    isConditionGroup(node) ? normalizeGroup(node) : normalizeRule(node),
  ),
});

/** Reports a tree that holds no rule and no group at all. */
const isClearedTree = (tree: IConditionGroup | undefined): boolean =>
  !Array.isArray(tree?.rules) || tree.rules.length === 0;

/**
 * Turns an issue path into a position the author can find.
 *
 * @param path - A dotted path such as `rules.0.rules.2`.
 * @returns A label such as `Rule 1.3`, or `All rules` for the root.
 */
function issueLocation(path: string): string {
  const positions = path
    .split(".")
    .filter((segment) => /^\d+$/.test(segment))
    .map((segment) => Number(segment) + 1);

  return positions.length === 0 ? "All rules" : `Rule ${positions.join(".")}`;
}

export function RuleBuilderModal(props: Readonly<RuleBuilderModalProps>) {
  const { open, initialData, onClose, onSave } = props;

  // Seed the form with healed data. A new object on every render would make
  // react-final-form reinitialise the form and drop the author's edits, so
  // this stays tied to the incoming reference.
  const initialValues = useMemo<RuleBuilderValues>(
    () => ({ rulesTree: normalizeGroup(initialData) }),
    [initialData],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Logic Rules</DialogTitle>

      <Form<RuleBuilderValues>
        initialValues={initialValues}
        onSubmit={(values) => {
          // The Enter key submits the form even while the button is disabled,
          // so the same check runs here.
          const { issues } = compileCondition(values.rulesTree);
          if (issues.length > 0 && !isClearedTree(values.rulesTree)) {
            return;
          }
          onSave(values.rulesTree);
        }}
        render={({ handleSubmit, values }) => {
          const compiled = compileCondition(values.rulesTree);
          const isCleared = isClearedTree(values.rulesTree);

          // A half-configured rule compiles to nothing, and the block then
          // renders its children with no `{{#if}}` at all. That leaks content
          // the author meant to gate, so the save waits until every rule is
          // complete. An empty tree is the one exception: it is how the
          // author removes the condition on purpose.
          const issues: ConditionIssue[] = isCleared ? [] : compiled.issues;
          const canSave = issues.length === 0;

          return (
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
                  <FilterRuleGroup
                    name="rulesTree"
                    nestingLevel={0}
                    index={0}
                  />
                </Box>

                {issues.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <AlertTitle>Finish every rule before you save</AlertTitle>
                    {issues.map((issue) => (
                      <Typography
                        key={`${issue.path}-${issue.code}`}
                        variant="body2"
                        component="div"
                      >
                        {`${issueLocation(issue.path)}: ${issue.message}`}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {isCleared && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No rules. The contents of this block always render.
                  </Alert>
                )}

                {canSave && !isCleared && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <AlertTitle>Show the block when</AlertTitle>
                    <Typography variant="body2" component="div">
                      {compiled.label}
                    </Typography>
                  </Alert>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!canSave}
                >
                  Save Logic
                </Button>
              </DialogActions>
            </form>
          );
        }}
      />
    </Dialog>
  );
}
