import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ICarousel } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type CarouselProps = RecursivePartial<ICarousel["data"]> &
  RecursivePartial<ICarousel["attributes"]> & {
    children?: MjmlBlockProps<ICarousel>["children"];
  };

export function Carousel(props: CarouselProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.CAROUSEL}
    >
      {props.children}
    </MjmlBlock>
  );
}
