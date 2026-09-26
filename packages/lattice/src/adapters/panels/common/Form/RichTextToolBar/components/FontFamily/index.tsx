import React from "react";
import { useFontFamily } from "@/application/hooks/useFontFamily";
import { DropdownCommandWrapper } from "../DropdownCommandWrapper";
import { FontFamilyIcon } from "@/adapters/ui/kit/Icons/FontFamilyIcon";

export interface FontFamilyProps {
  execCommand: (cmd: string, value: any) => void;
  selectionRange: Range | null | undefined;
  getPopoverMountNode?: () => HTMLElement | null;
}

export function FontFamily(props: FontFamilyProps) {
  const { fontList } = useFontFamily();

  if (fontList.length === 0) return null;

  return (
    <DropdownCommandWrapper
      title={t("Font family")}
      icon={<FontFamilyIcon />}
      options={fontList}
      selectionRange={props.selectionRange}
      getPopoverMountNode={props.getPopoverMountNode}
      onSelect={(val) => props.execCommand("fontName", val)}
    />
  );
}
