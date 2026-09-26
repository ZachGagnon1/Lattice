import React from "react";
import { IBlock, IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/domain/blocks/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/I18nManager";
import { BasicBlock } from "@/domain/blocks/render/BasicBlock";

export type IAccordionTitle = IBlockData<
  {
    color?: string;
    "background-color"?: string;
    "font-size"?: string;
    "font-family"?: string;
    padding?: string;
  },
  {}
>;

export const AccordionTitle: IBlock = createBlock({
  get name() {
    return t("Accordion title");
  },
  type: BasicType.ACCORDION_TITLE,
  create: (payload) => {
    const defaultData: IAccordionTitle = {
      type: BasicType.ACCORDION_TITLE,
      data: {
        value: {
          content: "Why use an accordion?",
        },
      },
      attributes: {
        "font-size": "13px",
        padding: "16px 16px 16px 16px",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION],
  render(params) {
    return (
      <BasicBlock params={params} tag="mj-accordion-title">
        {params.data.data.value.content}
      </BasicBlock>
    );
  },
});
