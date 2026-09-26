import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ISpacer } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type SpacerProps = RecursivePartial<ISpacer["data"]> &
  RecursivePartial<ISpacer["attributes"]> & {
    children?: MjmlBlockProps<ISpacer>["children"];
  };

export function Spacer(props: SpacerProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.SPACER}
    >
      {props.children}
    </MjmlBlock>
  );
}
