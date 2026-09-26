import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IWrapper } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type WrapperProps = RecursivePartial<IWrapper["data"]> &
  RecursivePartial<IWrapper["attributes"]> & {
    children?: MjmlBlockProps<IWrapper>["children"];
  };

export function Wrapper(props: WrapperProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.WRAPPER}
    >
      {props.children}
    </MjmlBlock>
  );
}
