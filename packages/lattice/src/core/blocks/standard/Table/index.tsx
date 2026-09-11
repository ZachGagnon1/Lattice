import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import { BasicBlock } from "@/core/components/BasicBlock";
import { t } from "@/core/utils";

export type ITable = IBlockData<
  {},
  {
    content: string;
    rowLoop?: {
      source: string;
      itemAs: string;
    };
  }
>;

export const Table = createBlock<ITable>({
  get name() {
    return t("Table");
  },
  type: BasicType.TABLE,
  create: (payload) => {
    const defaultData: ITable = {
      type: BasicType.TABLE,
      data: {
        value: {
          content: "",
          rowLoop: { source: "", itemAs: "" },
        },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.COLUMN,
    BasicType.HERO,
    BasicType.CONDITION,
    BasicType.FOR_LOOP,
  ],
  render(params) {
    const { data } = params;
    const { content, rowLoop } = data.data.value;

    let innerContent = content;
    if (rowLoop?.source) {
      const alias = rowLoop.itemAs ? ` as |${rowLoop.itemAs}|` : "";
      innerContent = `{{#each ${rowLoop.source}${alias}}}${content}{{/each}}`;
    }

    return (
      <BasicBlock params={params} tag="mj-table">
        {innerContent}
      </BasicBlock>
    );
  },
});
