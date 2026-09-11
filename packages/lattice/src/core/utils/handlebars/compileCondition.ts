/**
 * Compiles a condition rules tree into one Handlebars subexpression.
 *
 * One traversal produces the emitted expression, the editor label, the issue
 * list, and the leaf count. The editor overlay and the emitted template must
 * never describe different trees, so there is exactly one recursive walk.
 */

import {
  COMPARISON_OPERATORS,
  ComparisonOperator,
  ConditionIssue,
  IConditionGroup,
  IConditionRule,
  OPERATORS_WITHOUT_VALUE,
  OPERATOR_HELPER_NAMES,
  isConditionGroup,
} from "./types";
import { isBlankValue, normalizeFieldPath, toHbsLiteral } from "./literals";

/** The result of one compile pass over a rules tree. */
export interface CompiledCondition {
  /** The Handlebars subexpression. It is `""` when nothing valid compiles. */
  expression: string;
  /** A human readable form of the same tree, for the editor overlay. */
  label: string;
  /** Every problem the compiler found, in traversal order. */
  issues: ConditionIssue[];
  /** The count of leaf rules reached, valid or not. */
  ruleCount: number;
}

/** What one node contributes to its parent. `null` means "nothing". */
interface NodeOutput {
  expression: string;
  label: string;
}

/** Tells a known operator from a typo or an empty selection. */
const isComparisonOperator = (raw: string): raw is ComparisonOperator =>
  (COMPARISON_OPERATORS as readonly string[]).includes(raw);

/**
 * Builds the dotted path of a child node.
 *
 * @param parentPath - The path of the parent group. The root is `""`.
 * @param index - The position of the child inside `rules`.
 * @returns A path such as `rules.0` or `rules.2.rules.1`.
 */
const childPath = (parentPath: string, index: number): string =>
  parentPath === "" ? `rules.${index}` : `${parentPath}.rules.${index}`;

/**
 * Builds the human readable half of one rule.
 *
 * @param operator - The comparison the user picked.
 * @param path - The normalized field path.
 * @param value - The raw value the user typed.
 * @returns One short phrase, such as `age > 18`.
 */
function ruleLabel(
  operator: ComparisonOperator,
  path: string,
  value: string,
): string {
  switch (operator) {
    case "EQUALS":
      return `${path} equals "${value}"`;
    case "NOT_EQUALS":
      return `${path} not equals "${value}"`;
    case "CONTAINS":
      return `${path} contains "${value}"`;
    case "GREATER_THAN":
      return `${path} > ${value}`;
    case "LESS_THAN":
      return `${path} < ${value}`;
    case "IS_EMPTY":
      return `${path} is empty`;
    case "IS_NOT_EMPTY":
      return `${path} is not empty`;
  }
}

/**
 * Compiles one leaf rule.
 *
 * @param rule - The leaf node from the tree.
 * @param path - The dotted path of this node, for any issue.
 * @param issues - The collector for problems. This function appends to it.
 * @returns The expression and label, or `null` when the rule is invalid.
 */
function compileRule(
  rule: IConditionRule,
  path: string,
  issues: ConditionIssue[],
): NodeOutput | null {
  const fieldPath = normalizeFieldPath(rule?.fieldId);
  if (fieldPath === "") {
    issues.push({
      path,
      code: "MISSING_FIELD",
      message: "This rule has no field. Pick a field.",
    });
    return null;
  }

  const rawOperator = String(rule?.comparisonOperator ?? "");
  if (rawOperator === "") {
    issues.push({
      path,
      code: "MISSING_OPERATOR",
      message: `The rule for ${fieldPath} has no operator. Pick an operator.`,
    });
    return null;
  }

  // The old compiler had a `default:` branch that returned the bare field id.
  // A malformed operator then emitted `{{#if firstName}}`, which is a silent
  // truthy test that the author never asked for. Report it instead.
  if (!isComparisonOperator(rawOperator)) {
    issues.push({
      path,
      code: "UNKNOWN_OPERATOR",
      message: `The operator "${rawOperator}" is not known.`,
    });
    return null;
  }

  const operator: ComparisonOperator = rawOperator;
  const needsValue = !OPERATORS_WITHOUT_VALUE.includes(operator);
  const value = String(rule?.value ?? "");

  // An empty value used to emit the malformed `(gt age )`.
  if (needsValue && isBlankValue(value)) {
    issues.push({
      path,
      code: "MISSING_VALUE",
      message: `The rule for ${fieldPath} has no value. Type a value.`,
    });
    return null;
  }

  const label = ruleLabel(operator, fieldPath, value);
  const helper = OPERATOR_HELPER_NAMES[operator];

  // `IS_NOT_EMPTY` maps to `null`. A truthy test needs no helper, so the bare
  // path goes out without parentheses.
  if (helper === null) {
    return { expression: fieldPath, label };
  }

  if (!needsValue) {
    return { expression: `(${helper} ${fieldPath})`, label };
  }

  return { expression: `(${helper} ${fieldPath} ${toHbsLiteral(value)})`, label };
}

/**
 * Compiles one group and every node below it.
 *
 * @param group - The group node.
 * @param path - The dotted path of this group. The root is `""`.
 * @param issues - The collector for problems. This function appends to it.
 * @param counter - A one-field box that counts every leaf rule reached.
 * @returns The expression and label, or `null` when no child compiles.
 */
function compileGroup(
  group: IConditionGroup,
  path: string,
  issues: ConditionIssue[],
  counter: { rules: number },
): NodeOutput | null {
  const children = Array.isArray(group?.rules) ? group.rules : [];
  const compiled: NodeOutput[] = [];

  children.forEach((child, index) => {
    const nextPath = childPath(path, index);

    if (isConditionGroup(child)) {
      const output = compileGroup(child, nextPath, issues, counter);
      if (output) {
        compiled.push(output);
      }
      return;
    }

    counter.rules += 1;
    const output = compileRule(child as IConditionRule, nextPath, issues);
    if (output) {
      compiled.push(output);
    }
  });

  if (compiled.length === 0) {
    issues.push({
      path,
      code: "EMPTY_GROUP",
      message: "This group has no usable rule.",
    });
    return null;
  }

  // One child passes through without parentheses. That keeps the output the
  // same as the inline compiler it replaces.
  if (compiled.length === 1) {
    return compiled[0];
  }

  const helper = group?.logicalOperator === "OR" ? "or" : "and";
  const word = helper === "or" ? "OR" : "AND";

  return {
    expression: `(${helper} ${compiled.map((item) => item.expression).join(" ")})`,
    label: `(${compiled.map((item) => item.label).join(` ${word} `)})`,
  };
}

/**
 * Compiles a condition rules tree.
 *
 * The function never throws. A missing root, a missing `rules` array, or a
 * malformed node produces an issue and an empty expression.
 *
 * @param root - The root group of the rules tree, or `undefined`.
 * @returns The expression, the label, the issues, and the leaf rule count.
 */
export function compileCondition(
  root: IConditionGroup | undefined,
): CompiledCondition {
  const issues: ConditionIssue[] = [];
  const counter = { rules: 0 };

  if (!isConditionGroup(root)) {
    issues.push({
      path: "",
      code: "EMPTY_GROUP",
      message: "This group has no usable rule.",
    });
    return { expression: "", label: "", issues, ruleCount: 0 };
  }

  const output = compileGroup(root, "", issues, counter);

  return {
    expression: output?.expression ?? "",
    label: output?.label ?? "",
    issues,
    ruleCount: counter.rules,
  };
}
