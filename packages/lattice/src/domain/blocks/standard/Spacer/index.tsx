import React from "react";
import { IBlock, IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/shared/utils/block/createBlock";
import { merge } from "lodash-es";
import { BasicBlock } from "@/adapters/canvas/BasicBlock";
import { t } from "@/shared/utils/block";

export type ISpacer = IBlockData<{
  "container-background-color"?: string;
  height?: string;
  padding?: string;
}>;

export const Spacer: IBlock<ISpacer> = createBlock({
  get name() {
    return t("Spacer");
  },
  type: BasicType.SPACER,
  create: (payload) => {
    const defaultData: ISpacer = {
      type: BasicType.SPACER,
      data: {
        value: {},
      },
      attributes: {
        height: "20px",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    return <BasicBlock params={params} tag="mj-spacer" />;
  },
});
