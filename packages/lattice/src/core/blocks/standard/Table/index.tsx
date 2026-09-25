import React from "react";
import { IBlockData } from "@/core/typings";
import { BasicType } from "@/core/constants";
import { createBlock } from "@/core/utils/createBlock";
import { merge } from "lodash";
import { BasicBlock } from "@/core/components/BasicBlock";
import { t } from "@/core/utils";
import { wrapTableRowsInEach } from "@/core/utils/handlebars";

export type ITable = IBlockData<
  {},
  {
    content: string;
    rowLoop?: {
      source: string;
      itemAs: string;
      /**
       * The number of rows at the start that stay out of the loop.
       * Templates saved before this field do not have this value.
       */
      headerRows?: number;
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
          rowLoop: { source: "", itemAs: "", headerRows: 1 },
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

    const innerContent = wrapTableRowsInEach(content, rowLoop);

    return (
      <BasicBlock params={params} tag="mj-table">
        {innerContent}
      </BasicBlock>
    );
  },
});
