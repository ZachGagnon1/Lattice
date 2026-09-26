import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/shared/utils/block/createBlock";
import { merge } from "lodash-es";
import { BasicBlock } from "@/adapters/canvas/BasicBlock";
import { t } from "@/shared/utils/block";

export type IDivider = IBlockData<
  {
    "border-color"?: string;
    "border-style"?: string;
    "border-width"?: string;
    "container-background-color"?: string;
    width?: string;
    align?: "left" | "center" | "right";
    padding?: string;
  },
  {}
>;

export const Divider = createBlock<IDivider>({
  get name() {
    return t("Divider");
  },
  type: BasicType.DIVIDER,
  create: (payload) => {
    const defaultData: IDivider = {
      type: BasicType.DIVIDER,
      data: {
        value: {},
      },
      attributes: {
        align: "center",
        "border-width": "1px",
        "border-style": "solid",
        "border-color": "#C9CCCF",
        padding: "10px 0px 10px 0px",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    return <BasicBlock params={params} tag="mj-divider" />;
  },
});
