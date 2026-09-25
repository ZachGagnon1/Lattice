import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import { getChildIdx, t } from "@/core/utils";
import { BlockRenderer } from "@/core/components/BlockRenderer";
import { compileCondition, IConditionGroup } from "@/core/utils/handlebars";
import { BasicBlock } from "@/core/components/BasicBlock";
import { Section } from "../Section";
import { Column } from "../Column";
import he from "he";

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
      children: [Section.create({ children: [Column.create()] })],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE, BasicType.WRAPPER],
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
      const conditionLabel = hasCondition
        ? compiled.label
        : "(no condition set)";
      const label = `IF: ${conditionLabel}`;
      const wrapperAttributes = {
        ...data.attributes,
        padding: "0px",
        border: "1px solid #ff8c00",
      };

      const labelMarkup = `<mj-section padding="0px"><mj-column padding="0px"><mj-text padding="16px" font-size="11px" color="#ff8c00">${he.escape(label)}</mj-text></mj-column></mj-section>`;
      const placeholderMarkup = `<mj-section padding="0px"><mj-column><mj-text padding="20px">Drop a Section block here</mj-text></mj-column></mj-section>`;

      return (
        <BasicBlock
          params={{
            ...params,
            data: { ...data, attributes: wrapperAttributes },
          }}
          tag="mj-wrapper"
        >
          {labelMarkup}
          {data.children.length ? renderedChildren : placeholderMarkup}
        </BasicBlock>
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
