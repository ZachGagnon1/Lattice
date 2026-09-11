/**
 * Shared rule types for the logic blocks (Condition, ForLoop, Table rowLoop).
 *
 * This module is the single source of truth. It has no runtime dependencies,
 * so both the block renderers and the attribute panel can import it.
 */

/** Joins the rules of one group. One operator applies to the whole group. */
export type LogicalOperator = "AND" | "OR";

/** Every comparison the attribute panel can offer, in display order. */
export const COMPARISON_OPERATORS = [
  "EQUALS",
  "NOT_EQUALS",
  "CONTAINS",
  "GREATER_THAN",
  "LESS_THAN",
  "IS_EMPTY",
  "IS_NOT_EMPTY",
] as const;

/** One comparison between a field and an optional value. */
export type ComparisonOperator = (typeof COMPARISON_OPERATORS)[number];

/** Operators that take no right-hand value. */
export const OPERATORS_WITHOUT_VALUE: readonly ComparisonOperator[] = [
  "IS_EMPTY",
  "IS_NOT_EMPTY",
];

/** Human labels for the attribute panel `<Select>`. */
export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  EQUALS: "Equals",
  NOT_EQUALS: "Not Equals",
  CONTAINS: "Contains",
  GREATER_THAN: "Greater Than",
  LESS_THAN: "Less Than",
  IS_EMPTY: "Is Empty",
  IS_NOT_EMPTY: "Is Not Empty",
};

/** The `handlebars-helpers` functions that the compiler can emit. */
export type HandlebarsHelperName =
  | "eq"
  | "ne"
  | "contains"
  | "gt"
  | "lt"
  | "not";

/**
 * Maps an operator to its `handlebars-helpers` function.
 *
 * `IS_NOT_EMPTY` maps to `null` on purpose. A truthy test needs no helper, so
 * the compiler emits the bare field path instead of a subexpression.
 */
export const OPERATOR_HELPER_NAMES: Record<
  ComparisonOperator,
  HandlebarsHelperName | null
> = {
  EQUALS: "eq",
  NOT_EQUALS: "ne",
  CONTAINS: "contains",
  GREATER_THAN: "gt",
  LESS_THAN: "lt",
  IS_EMPTY: "not",
  IS_NOT_EMPTY: null,
};

/**
 * One leaf comparison in the rules tree.
 *
 * There is no `logicalOperator` field here on purpose. The parent group holds
 * the one operator that joins its rules. The old per-rule field was never read
 * by the compiler, so it silently did nothing.
 */
export interface IConditionRule {
  /** The field path, such as `firstName` or `user.first-name`. */
  fieldId: string;
  /** Empty while the user has not picked an operator yet. */
  comparisonOperator: ComparisonOperator | "";
  /** The right-hand value. Unused for `IS_EMPTY` and `IS_NOT_EMPTY`. */
  value: string;
}

/** A branch in the rules tree. It joins its children with one operator. */
export interface IConditionGroup {
  /** Joins every direct child of this group. */
  logicalOperator: LogicalOperator;
  /** The child rules and nested groups, in display order. */
  rules: Array<IConditionRule | IConditionGroup>;
}

/**
 * Tells a group apart from a leaf rule.
 *
 * @param node - Any node from the rules tree, or an unknown value.
 * @returns `true` when the node is a group.
 */
export const isConditionGroup = (node: unknown): node is IConditionGroup =>
  typeof node === "object" &&
  node !== null &&
  Array.isArray((node as { rules?: unknown }).rules);

/** Identifies why the compiler cannot use a node. */
export type ConditionIssueCode =
  | "MISSING_FIELD"
  | "MISSING_OPERATOR"
  | "MISSING_VALUE"
  | "UNKNOWN_OPERATOR"
  | "EMPTY_GROUP";

/** One problem that the compiler found in the rules tree. */
export interface ConditionIssue {
  /** Dotted path to the offending node inside the rules tree, e.g. "rules.0.rules.2". */
  path: string;
  /** The machine-readable reason. */
  code: ConditionIssueCode;
  /** A short sentence for the attribute panel. */
  message: string;
}

/** A loop's configuration, shared by the ForLoop block and the Table rowLoop. */
export interface ILoopConfig {
  /** The array field path to iterate, such as `order.items`. */
  source: string;
  /** The alias for the current item. The compiler defaults it when absent. */
  itemAs?: string;
  /** Leading rows excluded from the loop. Table only. */
  headerRows?: number;
}
