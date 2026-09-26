import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IDivider } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type DividerProps = RecursivePartial<IDivider["data"]> &
  RecursivePartial<IDivider["attributes"]> & {
    children?: MjmlBlockProps<IDivider>["children"];
  };

export function Divider(props: DividerProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.DIVIDER}
    >
      {props.children}
    </MjmlBlock>
  );
}
