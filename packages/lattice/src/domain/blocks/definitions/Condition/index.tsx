import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { getChildIdx } from "@/domain/blocks/block";
import { t } from "@/shared/utils/I18nManager";
import { BlockRenderer } from "@/domain/blocks/render/BlockRenderer";
import {
  compileCondition,
  CONDITION_CLOSE,
  CONDITION_ELSE,
  IConditionGroup,
} from "@/domain/compile/handlebars";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";
import { ConditionBranch } from "../ConditionBranch";
import { Section } from "../Section";
import { Column } from "../Column";
import he from "he";

export type IConditionBlock = IBlockData<
  {},
  {
    rulesTree: IConditionGroup;
  }
>;

const LAYOUT_TYPES: string[] = [
  BasicType.SECTION,
  BasicType.GROUP,
  BasicType.COLUMN,
];

// A Section with only empty Columns renders as blank space, so it does not count as content.
const holdsContent = (block: IBlockData): boolean =>
  block.children.some((child) =>
    LAYOUT_TYPES.includes(child.type) ? holdsContent(child) : true,
  );

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
      // The "if" branch comes before the "else" branch. The order matters.
      children: [
        {
          ...ConditionBranch.create({ data: { value: { branch: "if" } } }),
          title: t("If"),
          children: [Section.create({ children: [Column.create()] })],
        },
        {
          ...ConditionBranch.create({ data: { value: { branch: "else" } } }),
          title: t("Else"),
          children: [Section.create({ children: [Column.create()] })],
        },
      ],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE],
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

    const [ifBranch, elseBranch] = data.children;
    const [ifMarkup, elseMarkup] = renderedChildren;
    const hasIf = Boolean(ifBranch?.children.length);
    const hasElse = Boolean(elseBranch && holdsContent(elseBranch));

    // With no rule, the "if" branch always shows, so the "else" branch never shows.
    if (!hasCondition) return hasIf ? <>{ifMarkup}</> : null;
    if (!hasIf && !hasElse) return null;

    return (
      <>
        {`<mj-raw>{{#if ${conditionString}}}</mj-raw>`}
        {ifMarkup}
        {hasElse && `<mj-raw>${CONDITION_ELSE}</mj-raw>`}
        {hasElse && elseMarkup}
        {`<mj-raw>${CONDITION_CLOSE}</mj-raw>`}
      </>
    );
  },
});
