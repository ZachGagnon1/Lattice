import React from "react";
import { IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/I18nManager";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";

export type IRaw = IBlockData<{}, { content: string }>;

export const Raw = createBlock<IRaw>({
  get name() {
    return t("Raw");
  },
  type: BasicType.RAW,
  create: (payload) => {
    const defaultData: IRaw = {
      type: BasicType.RAW,
      data: {
        value: {
          content: "<% if (user) { %>",
        },
      },
      attributes: {},
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [
    BasicType.PAGE,
    BasicType.WRAPPER,
    BasicType.SECTION,
    BasicType.GROUP,
    BasicType.COLUMN,
    BasicType.HERO,
  ],
  render(params) {
    return (
      <BasicBlock params={params} tag="mj-raw">
        {params.data.data.value.content}
      </BasicBlock>
    );
  },
});
