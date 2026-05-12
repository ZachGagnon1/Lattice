import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import { t } from "@/core/utils";
import { BasicBlock } from "@/core/components/BasicBlock";
import { getPlaceholder } from "@/core/utils/getPlaceholder"; // <-- 1. Import this

export interface IConditionRule {
  fieldId: string;
  comparisonOperator: string;
  value: string;
  logicalOperator?: "AND" | "OR";
}

export interface IConditionGroup {
  logicalOperator: "AND" | "OR";
  rules: (IConditionRule | IConditionGroup)[];
}

export type ICondition = IBlockData<
  {},
  {
    rulesTree: IConditionGroup;
  }
>;

const compileRulesToString = (
  node: IConditionGroup | IConditionRule,
): string => {
  if (!node) return "";
  if (!("rules" in node)) {
    const { fieldId, comparisonOperator, value } = node;
    if (!fieldId) return "";
    switch (comparisonOperator) {
      case "EQUALS":
        return `(eq ${fieldId} '${value}')`;
      case "NOT_EQUALS":
        return `(neq ${fieldId} '${value}')`;
      case "GREATER_THAN":
        return `(gt ${fieldId} ${value})`;
      case "LESS_THAN":
        return `(lt ${fieldId} ${value})`;
      case "CONTAINS":
        return `(contains ${fieldId} '${value}')`;
      case "IS_EMPTY":
        return `(not ${fieldId})`;
      case "IS_NOT_EMPTY":
        return `${fieldId}`;
      default:
        return fieldId;
    }
  }
  if (node.rules && node.rules.length > 0) {
    const compiledRules = node.rules
      .map((rule) => compileRulesToString(rule))
      .filter((str) => str !== "");
    if (compiledRules.length === 0) return "";
    if (compiledRules.length === 1) return compiledRules[0];
    const operator = node.logicalOperator === "AND" ? "and" : "or";
    return `(${operator} ${compiledRules.join(" ")})`;
  }
  return "";
};

export const Condition = createBlock<ICondition>({
  get name() {
    return t("If Condition");
  },
  type: BasicType.CONDITION,
  create: (payload) => {
    const defaultData: ICondition = {
      type: BasicType.CONDITION,
      data: {
        value: { rulesTree: { logicalOperator: "AND", rules: [] } },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.PAGE,
    BasicType.WRAPPER,
    BasicType.SECTION,
    BasicType.COLUMN,
    BasicType.GROUP,
    BasicType.HERO,
  ],
  render(params) {
    const { data, children } = params;
    const rulesTree = data.data.value.rulesTree;
    const conditionString = compileRulesToString(rulesTree);
    const hasCondition = !!conditionString;

    // 2. Handle the Empty State!
    if (data.children.length === 0) {
      return (
        <React.Fragment>
          <BasicBlock params={params} tag="mj-raw">
            {hasCondition ? `{{#if ${conditionString}}}` : ""}
          </BasicBlock>

          {/* This renders the native visual dropzone with spacing & dashed borders */}
          <BasicBlock params={params} tag="mj-raw">
            {getPlaceholder(params)}
          </BasicBlock>

          <BasicBlock params={params} tag="mj-raw">
            {hasCondition ? `{{/if}}` : ""}
          </BasicBlock>
        </React.Fragment>
      );
    }

    // 3. Handle the Populated State
    if (!hasCondition) {
      return <>{children}</>;
    }

    return (
      <React.Fragment>
        <BasicBlock params={params} tag="mj-raw">
          {`{{#if ${conditionString}}}`}
        </BasicBlock>

        {children}

        <BasicBlock params={params} tag="mj-raw">
          {`{{/if}}`}
        </BasicBlock>
      </React.Fragment>
    );
  },
});
