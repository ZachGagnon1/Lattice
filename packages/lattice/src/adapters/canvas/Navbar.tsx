import { omit } from "lodash-es";
import { BasicType } from "@/domain/constants";
import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { INavbar } from "@/domain/blocks";
import MjmlBlock, { MjmlBlockProps } from "@/adapters/canvas/MjmlBlock";

export type NavbarProps = RecursivePartial<INavbar["data"]> &
  RecursivePartial<INavbar["attributes"]> & {
    children?: MjmlBlockProps<INavbar>["children"];
  };

export function Navbar(props: NavbarProps) {
  return (
    <MjmlBlock
      attributes={omit(props, ["data", "children", "value"])}
      value={props.value}
      type={BasicType.NAVBAR}
    >
      {props.children}
    </MjmlBlock>
  );
}
