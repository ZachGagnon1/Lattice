import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
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
 * An older panel saved the field as `{{firstName}}` and wrote an
 * unused `logicalOperator` to each rule. The function removes both, so
 * the next save matches what the compiler reads.
 *
 * @param rule - One leaf node from the saved tree.
 * @returns A new rule. It does not change the input.
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
 * @returns A new group. It does not change the input.
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

  // Seed the form with normalized data. A new object on each render would
  // reset the form and drop the author's edits, so the value stays tied to
  // the incoming reference.
  const initialValues = useMemo<RuleBuilderValues>(
    () => ({ rulesTree: normalizeGroup(initialData) }),
    [initialData],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Logic Rules</DialogTitle>
      <RuleBuilderForm
        initialValues={initialValues}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
}

function RuleBuilderForm({
  initialValues,
  onClose,
  onSave,
}: Readonly<{
  initialValues: RuleBuilderValues;
  onClose: () => void;
  onSave: (data: IConditionGroup) => void;
}>) {
  const methods = useForm<RuleBuilderValues>({ defaultValues: initialValues });
  const { control, handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const rulesTree = useWatch({ control, name: "rulesTree" });

  const onSubmit = (values: RuleBuilderValues) => {
    // The Enter key submits the form even while the button is disabled,
    // so the same check runs here.
    const { issues } = compileCondition(values.rulesTree);
    if (issues.length > 0 && !isClearedTree(values.rulesTree)) {
      return;
    }
    onSave(values.rulesTree);
  };

  const compiled = compileCondition(rulesTree);
  const isCleared = isClearedTree(rulesTree);

  // A half-configured rule compiles to nothing, and the block renders
  // its children with no `{{#if}}` at all. The result exposes content
  // the author wants to gate. So the save waits until every rule is
  // complete. An empty tree is the one exception: the author uses an
  // empty tree to remove the condition on purpose.
  const issues: ConditionIssue[] = isCleared ? [] : compiled.issues;
  const canSave = issues.length === 0;

  return (
    <FormProvider {...methods}>
      {/* DialogActions needs the form tag to handle the submit event natively. */}
      <form
        onSubmit={handleSubmit(onSubmit)}
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
    </FormProvider>
  );
}
