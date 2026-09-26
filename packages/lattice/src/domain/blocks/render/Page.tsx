import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IPage } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type PageProps = RecursivePartial<IPage["data"]> &
  RecursivePartial<IPage["attributes"]> & {
    children?: MjmlBlockProps<IPage>["children"];
  };

export function Page(props: PageProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.PAGE}
    >
      {props.children}
    </MjmlBlock>
  );
}
