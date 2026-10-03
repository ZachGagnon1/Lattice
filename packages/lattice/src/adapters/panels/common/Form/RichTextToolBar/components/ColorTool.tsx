import React, { useContext, useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import FontDownloadOutlinedIcon from "@mui/icons-material/FontDownloadOutlined";
import { ColorPickerPanel } from "../../ColorPicker/ColorPickerInput";
import { PresetColorsContext } from "@/adapters/panels/AttributePanel/components/provider/PresetColorsProvider";
import { ToolItem } from "./ToolItem";
import { ToolbarPopover, useToolbarPopup } from "./ToolbarPopover";
import { useToolbar } from "../ToolbarContext";
import { describeColor, toHexColor } from "@/shared/utils/colorName";

export interface ColorToolProps {
  kind: "text" | "background";
}

const config = {
  text: {
    title: "Text color",
    command: "foreColor",
    formatKey: "color",
    fallback: "#000000",
    Icon: FontDownloadOutlinedIcon,
  },
  background: {
    title: "Background color",
    command: "hiliteColor",
    formatKey: "backgroundColor",
    fallback: "#FFFF00",
    Icon: FontDownloadIcon,
  },
} as const;

export function ColorTool({ kind }: Readonly<ColorToolProps>) {
  const { title, command, formatKey, Icon } = config[kind];
  const { execCommand, format } = useToolbar();
  const { addCurrentColor } = useContext(PresetColorsContext);
  const popup = useToolbarPopup();
  const currentColor = format[formatKey];
  const defaultColor = currentColor || config[kind].fallback;
  const [draft, setDraft] = useState(defaultColor);

  useEffect(() => {
    if (popup.isOpen) setDraft(defaultColor);
  }, [popup.isOpen, defaultColor]);

  // A drag on the picker must not select the email text behind the popover.
  useEffect(() => {
    const body = popup.anchorEl?.ownerDocument.body;
    if (!body) return;
    const previous = body.style.getPropertyValue("user-select");
    body.style.setProperty("user-select", "none", "important");
    return () => {
      body.style.setProperty("user-select", previous);
    };
  }, [popup.anchorEl]);

  const apply = (color: string) => {
    const hex = toHexColor(color);
    if (!hex) return;
    popup.close();
    execCommand(command, hex);
    addCurrentColor(hex);
  };

  return (
    <>
      <ToolItem
        {...popup.triggerProps}
        title={`${t(title)}: ${describeColor(currentColor) || t("none")}`}
        isActive={popup.isOpen}
        aria-haspopup="dialog"
        icon={
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Icon sx={{ position: "relative", top: "-1px", fontSize: 15 }} />
            <span
              style={{
                borderBottom: `2px solid ${currentColor || "currentColor"}`,
                position: "absolute",
                width: "130%",
                left: "-15%",
                top: 16,
              }}
            />
          </span>
        }
      />
      <ToolbarPopover popup={popup} label={t(title)} initialFocus="input">
        <ColorPickerPanel
          value={draft}
          onChange={setDraft}
          onPick={apply}
          label={t(title)}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 1.5, pb: 1.5, justifyContent: "flex-end" }}
        >
          <Button size="small" onClick={() => popup.close()}>
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!toHexColor(draft)}
            onClick={() => apply(draft)}
          >
            {t("Apply")}
          </Button>
        </Stack>
      </ToolbarPopover>
    </>
  );
}
