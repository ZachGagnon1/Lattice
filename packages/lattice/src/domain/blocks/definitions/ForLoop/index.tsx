import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { getChildIdx } from "@/domain/blocks/block";
import { t } from "@/shared/utils/I18nManager";
import { BlockRenderer } from "@/domain/blocks/render/BlockRenderer";
import {
  compileLoopLabel,
  compileLoopOpen,
  LOOP_CLOSE,
} from "@/domain/compile/handlebars";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";
import { Section } from "../Section";
import { Column } from "../Column";
import he from "he";

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
      children: [Section.create({ children: [Column.create()] })],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE],
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
      const loopLabel = compileLoopLabel(loopConfig);
      const wrapperAttributes = {
        ...data.attributes,
        padding: "0px",
        border: "1px solid #1976d2",
      };

      const labelMarkup = `<mj-section padding="0px"><mj-column padding="0px"><mj-text padding="16px" font-size="11px" color="#1976d2">${he.escape(loopLabel)}</mj-text></mj-column></mj-section>`;
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
