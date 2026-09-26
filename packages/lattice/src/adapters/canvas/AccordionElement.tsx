import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IAccordionElement } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type AccordionElementProps = RecursivePartial<
  IAccordionElement["data"]
> &
  RecursivePartial<IAccordionElement["attributes"]> & {
    children?: MjmlBlockProps<IAccordionElement>["children"];
  };

export function AccordionElement(props: AccordionElementProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.ACCORDION_ELEMENT}
    >
      {props.children}
    </MjmlBlock>
  );
}
