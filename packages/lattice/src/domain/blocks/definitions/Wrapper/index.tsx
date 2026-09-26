import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import React, { CSSProperties } from "react";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";
import { t } from "@/shared/utils/I18nManager";

export type IWrapper = IBlockData<
  {
    "background-color"?: string;
    border?: string;
    "border-radius"?: string;
    "full-width"?: string;
    direction?: "ltr" | "rtl";
    padding?: string;
    "text-align"?: CSSProperties["textAlign"];
  },
  {}
>;

export const Wrapper = createBlock<IWrapper>({
  get name() {
    return t("Wrapper");
  },
  type: BasicType.WRAPPER,
  create: (payload) => {
    const defaultData: IWrapper = {
      type: BasicType.WRAPPER,
      data: {
        value: {},
      },
      attributes: {
        padding: "20px 0px 20px 0px",
        border: "none",
        direction: "ltr",
        "text-align": "center",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.PAGE],
  render(params) {
    return <BasicBlock params={params} tag="mj-wrapper" />;
  },
});
