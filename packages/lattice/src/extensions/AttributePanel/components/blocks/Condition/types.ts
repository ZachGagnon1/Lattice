export type LogicalOperator = "AND" | "OR";

export type ComparisonOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY";

export interface IConditionRule {
  fieldId: string;
  comparisonOperator: ComparisonOperator | "";
  value: string;
  logicalOperator?: LogicalOperator;
}

export interface IConditionGroupNode {
  logicalOperator: LogicalOperator;
  rules: Array<IConditionRule | IConditionGroupNode>;
}

export const isConditionGroup = (
  node: IConditionRule | IConditionGroupNode,
): node is IConditionGroupNode => {
  return "rules" in node;
};
