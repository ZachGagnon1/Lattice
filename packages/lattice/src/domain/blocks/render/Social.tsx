import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ISocial } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type SocialProps = RecursivePartial<ISocial["data"]> &
  RecursivePartial<ISocial["attributes"]> & {
    children?: MjmlBlockProps<ISocial>["children"];
  };

export function Social(props: SocialProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.SOCIAL}
    >
      {props.children}
    </MjmlBlock>
  );
}
