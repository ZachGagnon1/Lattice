import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IColumn } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type ColumnProps = RecursivePartial<IColumn["data"]> &
  RecursivePartial<IColumn["attributes"]> & {
    children?: MjmlBlockProps<IColumn>["children"];
  };

export function Column(props: ColumnProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.COLUMN}
    >
      {props.children}
    </MjmlBlock>
  );
}
