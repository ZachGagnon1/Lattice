import React, { CSSProperties } from "react";
import { IBlock, IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/I18nManager";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";

export type IImage = IBlockData<{
  alt?: string;
  src?: string;
  title?: string;
  href?: string;
  target?: string;
  border?: string;
  height?: string;
  "text-decoration"?: string;
  "text-transform"?: CSSProperties["textTransform"];
  align?: CSSProperties["textAlign"];
  "container-background-color"?: string;
  width?: string;
  padding?: string;
}>;

export const Image: IBlock<IImage> = createBlock({
  get name() {
    return t("Image");
  },
  type: BasicType.IMAGE,
  create: (payload) => {
    const defaultData: IImage = {
      type: BasicType.IMAGE,
      data: {
        value: {},
      },
      attributes: {
        align: "center",
        height: "auto",
        padding: "10px 25px 10px 25px",
        src: "",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.COLUMN, BasicType.HERO],
  render(params) {
    return <BasicBlock params={params} tag="mj-image" />;
  },
});
