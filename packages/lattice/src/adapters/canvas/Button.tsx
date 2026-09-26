import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IButton } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type ButtonProps = RecursivePartial<IButton["data"]> &
  RecursivePartial<IButton["attributes"]> & {
    children?: MjmlBlockProps<IButton>["children"];
  };

export function Button(props: ButtonProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.BUTTON}
    >
      {props.children}
    </MjmlBlock>
  );
}
