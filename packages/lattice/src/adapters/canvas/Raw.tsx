import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IRaw } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type RawProps = RecursivePartial<IRaw["data"]> &
  RecursivePartial<IRaw["attributes"]> & {
    children?: MjmlBlockProps<IRaw>["children"];
  };

export function Raw(props: RawProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.RAW}
    >
      {props.children}
    </MjmlBlock>
  );
}
