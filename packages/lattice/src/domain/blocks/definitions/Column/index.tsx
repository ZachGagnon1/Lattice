import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/I18nManager";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";

export type IColumn = IBlockData<
  {
    "background-color"?: string;
    border?: string;
    "border-radius"?: string;
    "inner-border"?: string;
    "inner-border-radius"?: string;
    padding?: string;
    "text-align"?: string;
    "vertical-align"?: string;
    width?: string;
  },
  {}
>;

export const Column = createBlock<IColumn>({
  get name() {
    return t("Column");
  },
  type: BasicType.COLUMN,
  create: (payload) => {
    const defaultData: IColumn = {
      type: BasicType.COLUMN,
      data: {
        value: {},
      },
      attributes: {
        padding: "0px 0px 0px 0px",
        border: "none",
        "vertical-align": "top",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.SECTION, BasicType.GROUP],

  render(params) {
    return <BasicBlock params={params} tag="mj-column" />;
  },
});
