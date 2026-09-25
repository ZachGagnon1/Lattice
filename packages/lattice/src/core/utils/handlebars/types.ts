/**
 * The rule types for the logic blocks: Condition, ForLoop, and the Table
 * `rowLoop`.
 *
 * The module holds these types once. It has no runtime dependency.
 * Both the block renderers and the attribute panel import it.
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
export type HandlebarsHelperName = "eq" | "contains" | "gt" | "lt" | "not";

/**
 * Maps an operator to its `handlebars-helpers` function.
 *
 * `IS_NOT_EMPTY` maps to `null` on purpose. A truthy test needs no helper, so
 * the compiler emits the bare field path, not a subexpression.
 *
 * `NOT_EQUALS` maps to `eq`. {@link NEGATED_OPERATORS} wraps the result in
 * `not`. `handlebars-helpers` has no `ne` helper. Its `isnt` helper compares
 * with `!=`. The `eq` helper compares with `===`. The pair would not agree.
 * `(not (eq a b))` is the exact negation of Equals. It needs only helpers that
 * the library provides.
 */
export const OPERATOR_HELPER_NAMES: Record<
  ComparisonOperator,
  HandlebarsHelperName | null
> = {
  EQUALS: "eq",
  NOT_EQUALS: "eq",
  CONTAINS: "contains",
  GREATER_THAN: "gt",
  LESS_THAN: "lt",
  IS_EMPTY: "not",
  IS_NOT_EMPTY: null,
};

/** Operators whose subexpression the compiler wraps in `not`. */
export const NEGATED_OPERATORS: readonly ComparisonOperator[] = ["NOT_EQUALS"];

/**
 * One leaf comparison in the rules tree.
 *
 * It has no `logicalOperator` field on purpose. The parent group holds the one
 * operator that joins its rules. The compiler never read the old per-rule
 * field, so that field did nothing.
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

/** Tells a group apart from a leaf rule. */
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

/** One problem that the compiler finds in the rules tree. */
export interface ConditionIssue {
  /** Dotted path to the offending node inside the rules tree, e.g. "rules.0.rules.2". */
  path: string;
  code: ConditionIssueCode;
  /** A short sentence for the attribute panel. */
  message: string;
}

/** The loop configuration that the ForLoop block and the Table rowLoop share. */
export interface ILoopConfig {
  /** The array field path to iterate, such as `order.items`. */
  source: string;
  /** The alias for the current item. The compiler defaults it when absent. */
  itemAs?: string;
  /** The count of leading rows that stay out of the loop. Only Table uses it. */
  headerRows?: number;
}
