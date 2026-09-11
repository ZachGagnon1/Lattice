import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType, EMAIL_BLOCK_CLASS_NAME } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import {
  getChildIdx,
  getNodeIdxClassName,
  getNodeTypeClassName,
  t,
} from "@/core/utils";
import { BlockRenderer } from "@/core/components/BlockRenderer";
import { compileCondition, IConditionGroup } from "@/core/utils/handlebars";

export type IConditionBlock = IBlockData<
  {},
  {
    rulesTree: IConditionGroup;
  }
>;

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
    BasicType.CONDITION,
    BasicType.FOR_LOOP,
  ],
  render(params) {
    const { data, idx, mode } = params;
    const compiled = compileCondition(data.data.value.rulesTree);
    const conditionString = compiled.expression;
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

      const conditionLabel = hasCondition ? compiled.label : "(no condition set)";

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
