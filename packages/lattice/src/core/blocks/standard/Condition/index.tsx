import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType, EMAIL_BLOCK_CLASS_NAME } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import { getChildIdx, getNodeIdxClassName, getNodeTypeClassName, t } from "@/core/utils";
import { BlockRenderer } from "@/core/components/BlockRenderer";

export interface IConditionBlockRule {
  fieldId: string;
  comparisonOperator: string;
  value: string;
  logicalOperator?: "AND" | "OR";
}

export interface IConditionBlockGroup {
  logicalOperator: "AND" | "OR";
  rules: (IConditionBlockRule | IConditionBlockGroup)[];
}

export type IConditionBlock = IBlockData<
  {},
  {
    rulesTree: IConditionBlockGroup;
  }
>;

const compileRulesToHumanReadable = (
  node: IConditionBlockGroup | IConditionBlockRule,
): string => {
  if (!node) return "";
  if (!("rules" in node)) {
    const { fieldId, comparisonOperator, value } = node;
    if (!fieldId) return "";
    switch (comparisonOperator) {
      case "EQUALS":
        return `${fieldId} equals "${value}"`;
      case "NOT_EQUALS":
        return `${fieldId} not equals "${value}"`;
      case "GREATER_THAN":
        return `${fieldId} > ${value}`;
      case "LESS_THAN":
        return `${fieldId} < ${value}`;
      case "CONTAINS":
        return `${fieldId} contains "${value}"`;
      case "IS_EMPTY":
        return `${fieldId} is empty`;
      case "IS_NOT_EMPTY":
        return `${fieldId} is not empty`;
      default:
        return fieldId;
    }
  }
  if (node.rules && node.rules.length > 0) {
    const parts = node.rules
      .map((rule) => compileRulesToHumanReadable(rule))
      .filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return `(${parts.join(` ${node.logicalOperator} `)})`;
  }
  return "";
};

const compileRulesToString = (
  node: IConditionBlockGroup | IConditionBlockRule,
): string => {
  if (!node) return "";
  if (!("rules" in node)) {
    const { fieldId, comparisonOperator, value } = node;
    if (!fieldId) return "";
    switch (comparisonOperator) {
      case "EQUALS":
        return `(eq ${fieldId} '${value}')`;
      case "NOT_EQUALS":
        return `(ne ${fieldId} '${value}')`;
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

export const Condition = createBlock<IConditionBlock>({
  get name() {
    return t("If Condition");
  },
  type: BasicType.CONDITION,
  create: (payload) => {
    const defaultData: IConditionBlock = {
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
    const { data, idx, mode } = params;
    const rulesTree = data.data.value.rulesTree;
    const conditionString = compileRulesToString(rulesTree);
    const hasCondition = !!conditionString;

    const renderedChildren = data.children.map((child, index) => (
      <BlockRenderer
        key={index}
        {...params}
        idx={idx ? getChildIdx(idx, index) : null}
        data={child}
      />
    ));

    if (mode === "testing") {
      const blockClass = [
        EMAIL_BLOCK_CLASS_NAME,
        idx && getNodeIdxClassName(idx),
        getNodeTypeClassName(BasicType.CONDITION),
      ]
        .filter(Boolean)
        .join(" ");

      const conditionLabel = hasCondition
        ? compileRulesToHumanReadable(rulesTree)
        : "(no condition set)";

      if (data.children.length === 0) {
        return (
          <>
            {`<mj-raw><div class="${blockClass}" style="border: 2px dashed #d9d9d9; padding: 20px; text-align: center; color: #999; background: #fafafa; cursor: pointer;"><div style="margin-bottom: 6px; font-size: 11px; color: #ff8c00; font-weight: 500; font-family: monospace;">IF: ${conditionLabel}</div><div>Drop a block here</div></div></mj-raw>`}
          </>
        );
      }

      return (
        <>
          {`<mj-raw><div class="${blockClass}" style="border-left: 3px solid #ff8c00; background: rgba(255,140,0,0.05); padding: 3px 8px; font-size: 11px; font-family: monospace; color: #ff8c00;">IF: ${conditionLabel}</div></mj-raw>`}
          {renderedChildren}
          {`<mj-raw><div style="border-left: 3px solid #ff8c00; background: rgba(255,140,0,0.05); padding: 3px 8px; font-size: 11px; font-family: monospace; color: #ff8c00;">/IF</div></mj-raw>`}
        </>
      );
    }

    // Production mode
    if (data.children.length === 0) return null;

    if (!hasCondition) {
      return <>{renderedChildren}</>;
    }

    return (
      <>
        {`<mj-raw>{{#if ${conditionString}}}</mj-raw>`}
        {renderedChildren}
        {`<mj-raw>{{/if}}</mj-raw>`}
      </>
    );
  },
});
