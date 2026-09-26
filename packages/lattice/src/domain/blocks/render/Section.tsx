import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ISection } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type SectionProps = RecursivePartial<ISection["data"]> &
  RecursivePartial<ISection["attributes"]> & {
    children?: MjmlBlockProps<ISection>["children"];
  };

export function Section(props: SectionProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.SECTION}
    >
      {props.children}
    </MjmlBlock>
  );
}
