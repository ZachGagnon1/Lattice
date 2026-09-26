import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/shared/utils/block/createBlock";
import { merge } from "lodash-es";
import { BlockRenderer } from "@/adapters/canvas/BlockRenderer";
import { t } from "@/shared/utils/block";

export type ITemplate = IBlockData<
  {},
  {
    idx?: string | null;
  }
>;

export const Template = createBlock<ITemplate>({
  get name() {
    return t("Template");
  },
  type: BasicType.TEMPLATE,
  create: (payload) => {
    const defaultData: ITemplate = {
      type: BasicType.TEMPLATE,
      data: {
        value: {
          idx: "",
        },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [],
  render(params) {
    const { data } = params;
    return (
      <>
        {`
          ${data.children.map((child) => (
            <BlockRenderer {...params} data={child} />
          ))}
        `}
      </>
    );
  },
});
