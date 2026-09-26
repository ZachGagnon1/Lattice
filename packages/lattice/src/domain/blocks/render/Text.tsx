import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IText } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type TextProps = RecursivePartial<IText["data"]> &
  RecursivePartial<IText["attributes"]> & {
    children?: MjmlBlockProps<IText>["children"];
  };

export function Text(props: TextProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.TEXT}
    >
      {props.children}
    </MjmlBlock>
  );
}
