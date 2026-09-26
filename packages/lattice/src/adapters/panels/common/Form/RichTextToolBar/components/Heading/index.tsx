import React from "react";
import { DropdownCommandWrapper } from "../DropdownCommandWrapper";
import TitleIcon from "@mui/icons-material/Title";

export interface HeadingProps {
  onChange: (val: string) => void;
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
}

export function Heading(props: HeadingProps) {
  const list = [
    { value: "H1", label: "H1" },
    { value: "H2", label: "H2" },
    { value: "H3", label: "H3" },
    { value: "H4", label: "H4" },
    { value: "H5", label: "H5" },
    { value: "H6", label: "H6" },
    { value: "P", label: t("Paragraph") },
  ];

  return (
    <DropdownCommandWrapper
      title={t("Heading")}
      icon={<TitleIcon />}
      options={list}
      selectionRange={props.selectionRange}
      getPopoverMountNode={props.getPopoverMountNode}
      onSelect={props.onChange}
    />
  );
}
