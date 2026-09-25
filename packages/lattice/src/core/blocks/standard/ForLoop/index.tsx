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
import {
  compileLoopLabel,
  compileLoopOpen,
  LOOP_CLOSE,
} from "@/core/utils/handlebars";

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

    // The compiler reads `source`, but the block stores `dataSource`.
    // We keep `dataSource` because saved templates use that name.
    const loopConfig = { source: dataSource, itemAs };
    const loopOpen = compileLoopOpen(loopConfig);

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

      const loopLabel = compileLoopLabel(loopConfig);

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
        {`<mj-raw>${LOOP_CLOSE}</mj-raw>`}
      </>
    );
  },
});
