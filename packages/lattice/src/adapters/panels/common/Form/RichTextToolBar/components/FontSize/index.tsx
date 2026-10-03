import React from "react";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import { DropdownTool } from "../DropdownTool";
import { useToolbar } from "../../ToolbarContext";

// `execCommand("fontSize")` takes the HTML sizes 1 to 7. The labels are their pixel sizes.
const options = [
  { value: "1", label: "10px" },
  { value: "2", label: "13px" },
  { value: "3", label: "16px" },
  { value: "4", label: "18px" },
  { value: "5", label: "24px" },
  { value: "6", label: "32px" },
  { value: "7", label: "48px" },
];

export function FontSize() {
  const { execCommand, format } = useToolbar();
  const selected = options.find((option) => option.label === format.fontSize);

  return (
    <DropdownTool
      title={t("Font size")}
      icon={<FormatSizeIcon />}
      options={options}
      selected={selected?.value}
      currentLabel={format.fontSize}
      onSelect={(value) => execCommand("fontSize", value)}
    />
  );
}
