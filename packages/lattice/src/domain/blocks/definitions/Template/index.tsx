import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { BlockRenderer } from "@/domain/blocks/render/BlockRenderer";
import { t } from "@/shared/utils/I18nManager";

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
