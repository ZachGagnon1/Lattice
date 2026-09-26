import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IImage } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type ImageProps = RecursivePartial<IImage["data"]> &
  RecursivePartial<IImage["attributes"]> & {
    children?: MjmlBlockProps<IImage>["children"];
  };

export function Image(props: ImageProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.IMAGE}
    >
      {props.children}
    </MjmlBlock>
  );
}
