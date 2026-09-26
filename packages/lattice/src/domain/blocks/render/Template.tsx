import { RecursivePartial } from "@/domain/typings";
import React from "react";
import { ITemplate } from "@/domain/blocks";

export type TemplateProps = RecursivePartial<ITemplate["data"]> &
  RecursivePartial<ITemplate["attributes"]> & {
    children: string | React.ReactNode;
    idx?: string | null;
  };

export function Template(props: TemplateProps) {
  return props.children;
}
