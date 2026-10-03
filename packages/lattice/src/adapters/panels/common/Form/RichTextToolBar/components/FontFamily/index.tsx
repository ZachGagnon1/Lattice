import React from "react";
import { useFontFamily } from "@/application/hooks/useFontFamily";
import { FontFamilyIcon } from "@/adapters/ui/kit/Icons/FontFamilyIcon";
import { DropdownTool } from "../DropdownTool";
import { useToolbar } from "../../ToolbarContext";
import { firstFontFamily } from "../../formatState";

export function FontFamily() {
  const { execCommand, format } = useToolbar();
  const { fontList } = useFontFamily();

  if (fontList.length === 0) return null;

  const current = format.fontFamily.toLowerCase();
  const selected = fontList.find(
    (font) => firstFontFamily(font.value).toLowerCase() === current,
  );

  return (
    <DropdownTool
      title={t("Font family")}
      icon={<FontFamilyIcon />}
      options={fontList}
      selected={selected?.value}
      currentLabel={format.fontFamily}
      onSelect={(value) => execCommand("fontName", value)}
    />
  );
}
