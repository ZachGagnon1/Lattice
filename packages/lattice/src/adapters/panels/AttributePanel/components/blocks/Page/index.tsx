import React from "react";
import {
  ColorPickerField,
  InputWithUnitField,
  NumberField,
  TextAreaField,
  TextField,
} from "@/adapters/panels/common/Form";
import { AddFont } from "@/adapters/panels/common/Form/AddFont";
import { useFocusIdx } from "@";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { FontFamily } from "@/adapters/panels/AttributePanel";
import { pixelAdapter } from "../../adapter";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

interface PageProps {
  hideSubTitle?: boolean;
  hideSubject?: boolean;
}
export function Page({ hideSubTitle, hideSubject }: PageProps) {
  const { focusIdx } = useFocusIdx();

  if (!focusIdx) {
    return null;
  }

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Email Setting")}>
        <Stack spacing={2}>
          {!hideSubject && <TextField label={t("Subject")} name={"subject"} />}
          {!hideSubTitle && (
            <TextField label={t("SubTitle")} name={"subTitle"} />
          )}
          <InputWithUnitField
            label={t("Width")}
            name={`${focusIdx}.attributes.width`}
          />
          <InputWithUnitField
            label={t("Breakpoint")}
            helpText={t(
              "Allows you to control on which breakpoint the layout should go desktop/mobile.",
            )}
            name={`${focusIdx}.data.value.breakpoint`}
          />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Theme Setting")}>
        <Stack spacing={2}>
          <FontFamily name={`${focusIdx}.data.value.font-family`} />
          <NumberField
            label="Font size (px)"
            name={`${focusIdx}.data.value.font-size`}
            config={pixelAdapter}
            autoComplete="off"
          />
          <InputWithUnitField
            label={t("Line height")}
            unitOptions="percent"
            name={`${focusIdx}.data.value.line-height`}
          />
          <InputWithUnitField
            label={t("Font weight")}
            unitOptions="percent"
            name={`${focusIdx}.data.value.font-weight`}
          />
          <ColorPickerField
            label={t("Text color")}
            name={`${focusIdx}.data.value.text-color`}
          />
          <ColorPickerField
            label={t("Background")}
            name={`${focusIdx}.attributes.background-color`}
          />
          <ColorPickerField
            label={t("Content background")}
            name={`${focusIdx}.data.value.content-background-color`}
          />

          <TextAreaField
            label={t("User style")}
            name={`${focusIdx}.data.value.user-style.content`}
          />

          <AddFont />
        </Stack>
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
