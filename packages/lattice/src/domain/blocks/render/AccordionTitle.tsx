import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IAccordionTitle } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type AccordionTitleProps = RecursivePartial<IAccordionTitle["data"]> &
  RecursivePartial<IAccordionTitle["attributes"]> & {
    children?: MjmlBlockProps<IAccordionTitle>["children"];
  };

export function AccordionTitle(props: AccordionTitleProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.ACCORDION_TITLE}
    >
      {props.children}
    </MjmlBlock>
  );
}
