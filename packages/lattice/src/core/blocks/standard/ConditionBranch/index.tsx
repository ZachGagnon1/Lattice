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
import he from "he";

export type ConditionBranchKind = "if" | "else";

export type IConditionBranch = IBlockData<{}, { branch: ConditionBranchKind }>;

export const ConditionBranch = createBlock<IConditionBranch>({
  get name() {
    return t("Condition Branch");
  },
  type: BasicType.CONDITION_BRANCH,
  create: (payload) => {
    const defaultData: IConditionBranch = {
      type: BasicType.CONDITION_BRANCH,
      data: { value: { branch: "if" } },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.CONDITION],
  render(params) {
    const { data, idx, mode } = params;
    const isElse = data.data.value.branch === "else";

    const renderedChildren = data.children.map((child, index) => (
      <BlockRenderer
        key={index}
        {...params}
        idx={idx ? getChildIdx(idx, index) : null}
        data={child}
      />
    ));

    if (mode !== "testing") return <>{renderedChildren}</>;

    // MJML rejects an mj-wrapper inside the Condition's mj-wrapper, so the
    // strip holds the branch classes and gives an empty branch a drop target.
    const className = [
      EMAIL_BLOCK_CLASS_NAME,
      idx && getNodeIdxClassName(idx),
      getNodeTypeClassName(BasicType.CONDITION_BRANCH),
    ]
      .filter(Boolean)
      .join(" ");
    const isEmpty = data.children.length === 0;
    const text = [isElse && "ELSE", isEmpty && "Drop a Section block here"]
      .filter(Boolean)
      .join(": ");
    const strip = text
      ? `<mj-section padding="0px" css-class="${className}"><mj-column padding="0px"><mj-text padding="16px" font-size="11px" color="#ff8c00">${he.escape(text)}</mj-text></mj-column></mj-section>`
      : "";

    return (
      <>
        {strip}
        {renderedChildren}
      </>
    );
  },
});
