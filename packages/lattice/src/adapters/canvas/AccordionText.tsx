import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IAccordionText } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type AccordionTextProps = RecursivePartial<IAccordionText["data"]> &
  RecursivePartial<IAccordionText["attributes"]> & {
    children?: MjmlBlockProps<IAccordionText>["children"];
  };

export function AccordionText(props: AccordionTextProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.ACCORDION_TEXT}
    >
      {props.children}
    </MjmlBlock>
  );
}
