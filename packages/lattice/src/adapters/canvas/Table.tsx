import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ITable } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type TableProps = RecursivePartial<ITable["data"]> &
  RecursivePartial<ITable["attributes"]> & {
    children?: MjmlBlockProps<ITable>["children"];
  };

export function Table(props: TableProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.TABLE}
    >
      {props.children}
    </MjmlBlock>
  );
}
