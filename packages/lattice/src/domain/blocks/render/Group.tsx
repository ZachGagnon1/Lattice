import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IGroup } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type GroupProps = RecursivePartial<IGroup["data"]> &
  RecursivePartial<IGroup["attributes"]> & {
    children?: MjmlBlockProps<IGroup>["children"];
  };

export function Group(props: GroupProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.GROUP}
    >
      {props.children}
    </MjmlBlock>
  );
}
