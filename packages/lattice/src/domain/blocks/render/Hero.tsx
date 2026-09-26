import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { IHero } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/domain/blocks/render/MjmlBlock";

export type HeroProps = RecursivePartial<IHero["data"]> &
  RecursivePartial<IHero["attributes"]> & {
    children?: MjmlBlockProps<IHero>["children"];
  };

export function Hero(props: HeroProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.HERO}
    >
      {props.children}
    </MjmlBlock>
  );
}
