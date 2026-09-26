import React from "react";
import { IBlock, IBlockData } from "@/domain/typings";
import { BasicType } from "@/domain/constants";
import { createBlock } from "@/shared/utils/block/createBlock";
import { merge } from "lodash-es";
import { t } from "@/shared/utils/block";
import { BasicBlock } from "@/adapters/canvas/BasicBlock";

export type IAccordionText = IBlockData<
  {
    color?: string;
    "background-color"?: string;
    "font-size"?: string;
    "font-family"?: string;
    padding?: string;
    "font-weight"?: string;
    "line-height"?: string;
    "letter-spacing"?: string;
  },
  {}
>;

export const AccordionText: IBlock = createBlock({
  get name() {
    return t("Accordion text");
  },
  type: BasicType.ACCORDION_TEXT,
  create: (payload) => {
    const defaultData: IAccordionText = {
      type: BasicType.ACCORDION_TEXT,
      data: {
        value: {
          content:
            "Because emails with a lot of content are most of the time a very bad experience on mobile, mj-accordion comes handy when you want to deliver a lot of information in a concise way",
        },
      },
      attributes: {
        "font-size": "13px",
        padding: "16px 16px 16px 16px",
        "line-height": "1",
      },
      children: [],
    };
    return merge(defaultData, payload);
  },
  validParentType: [BasicType.ACCORDION],
  render(params) {
    return (
      <BasicBlock params={params} tag="mj-accordion-text">
        {params.data.data.value.content}
      </BasicBlock>
    );
  },
});
