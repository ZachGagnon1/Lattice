import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { cloneDeep, mergeWith } from "lodash-es";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";
import { t } from "@/shared/utils/I18nManager";
import { wrapTableRowsInEach } from "@/domain/compile/handlebars";
import { tableSourceToHtml } from "./tableSource";

export interface ITableCellData {
  content: string;
  colSpan?: number;
  rowSpan?: number;
  backgroundColor?: string;
}

export type ITable = IBlockData<
  {
    cellPadding?: string;
    cellBorderColor?: string;
    "font-style"?: string;
    "text-align"?: string;
  },
  {
    tableSource: ITableCellData[][];
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

const DEFAULT_TABLE_SOURCE: ITableCellData[][] = [
  [{ content: "Header 1" }, { content: "Header 2" }, { content: "Header 3" }],
  [{ content: "Cell 1-1" }, { content: "Cell 1-2" }, { content: "Cell 1-3" }],
  [{ content: "Cell 2-1" }, { content: "Cell 2-2" }, { content: "Cell 2-3" }],
];

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
          tableSource: cloneDeep(DEFAULT_TABLE_SOURCE),
          rowLoop: { source: "", itemAs: "", headerRows: 1 },
        },
      },
      attributes: {
        cellPadding: "8px",
        cellBorderColor: "#dddddd",
      },
      children: [],
    };
    // A payload array replaces the default. An index-wise merge mixes two grids.
    return mergeWith(defaultData, payload, (_, source) =>
      Array.isArray(source) ? source : undefined,
    );
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    const { data } = params;
    const { tableSource, rowLoop } = data.data.value;
    const content = tableSourceToHtml(tableSource || [], data.attributes);

    const innerContent = wrapTableRowsInEach(content, rowLoop);

    return (
      <BasicBlock params={params} tag="mj-table">
        {innerContent}
      </BasicBlock>
    );
  },
});
