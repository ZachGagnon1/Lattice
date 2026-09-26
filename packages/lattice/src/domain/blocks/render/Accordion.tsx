import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IAccordion } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type AccordionProps = RecursivePartial<IAccordion["data"]> &
  RecursivePartial<IAccordion["attributes"]> & {
    children?: MjmlBlockProps<IAccordion>["children"];
  };

export function Accordion(props: AccordionProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.ACCORDION}
    >
      {props.children}
    </MjmlBlock>
  );
}
