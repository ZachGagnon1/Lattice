import React from "react";
import { IBlock, IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/I18nManager";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";

export type IGroup = IBlockData<{
  width?: string;
  "vertical-align"?: "middle" | "top" | "bottom";
  "background-color"?: string;
  direction?: "ltr" | "rtl";
}>;

export const Group: IBlock<IGroup> = createBlock({
  get name() {
    return t("Group");
  },
  type: BasicType.GROUP,
  create: (payload) => {
    const defaultData: IGroup = {
      type: BasicType.GROUP,
      data: {
        value: {},
      },
      attributes: {
        "vertical-align": "top",
        direction: "ltr",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.SECTION],

  render(params) {
    return <BasicBlock params={params} tag="mj-group" />;
  },
});
