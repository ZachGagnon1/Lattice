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

export type IForLoop = IBlockData<
  {},
  {
    dataSource: string;
    itemAs: string;
  }
>;

export const ForLoop = createBlock<IForLoop>({
  get name() {
    return t("For Loop");
  },
  type: BasicType.FOR_LOOP,
  create: (payload) => {
    const defaultData: IForLoop = {
      type: BasicType.FOR_LOOP,
      data: {
        value: { dataSource: "", itemAs: "" },
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
    const { dataSource, itemAs } = data.data.value;

    const loopOpen = dataSource
      ? `{{#each ${dataSource}${itemAs ? ` as |${itemAs}|` : ""}}}`
      : null;

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
        getNodeTypeClassName(BasicType.FOR_LOOP),
      ]
        .filter(Boolean)
        .join(" ");

      const loopLabel = dataSource
        ? `FOR EACH: ${dataSource}${itemAs ? ` as |${itemAs}|` : ""}`
        : "(no data source set)";

      if (data.children.length === 0) {
        return (
          <>
            {`<mj-raw><div class="${blockClass}" style="border: 2px dashed #d9d9d9; padding: 20px; text-align: center; color: #999; background: #fafafa; cursor: pointer;"><div style="margin-bottom: 6px; font-size: 11px; color: #1976d2; font-weight: 500; font-family: monospace;">${loopLabel}</div><div>Drop a block here</div></div></mj-raw>`}
          </>
        );
      }

      return (
        <>
          {`<mj-raw><div class="${blockClass}" style="border-left: 3px solid #1976d2; background: rgba(25,118,210,0.05); padding: 3px 8px; font-size: 11px; font-family: monospace; color: #1976d2;">${loopLabel}</div></mj-raw>`}
          {renderedChildren}
          {`<mj-raw><div style="border-left: 3px solid #1976d2; background: rgba(25,118,210,0.05); padding: 3px 8px; font-size: 11px; font-family: monospace; color: #1976d2;">/FOR EACH</div></mj-raw>`}
        </>
      );
    }

    if (data.children.length === 0) return null;

    if (!loopOpen) {
      return <>{renderedChildren}</>;
    }

    return (
      <>
        {`<mj-raw>${loopOpen}</mj-raw>`}
        {renderedChildren}
        {`<mj-raw>{{/each}}</mj-raw>`}
      </>
    );
  },
});
