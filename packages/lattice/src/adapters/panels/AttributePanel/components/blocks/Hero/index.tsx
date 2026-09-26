import React from "react";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import {
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  TextField,
} from "@/adapters/panels/common/Form";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { Height } from "@/adapters/panels/AttributePanel/components/attributes/Height";
import { VerticalAlign } from "@/adapters/panels/AttributePanel/components/attributes/VerticalAlign";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { useEditorProps, useFocusIdx } from "@";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { ClassName } from "../../attributes/ClassName";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

const options = [
  {
    value: "fluid-height",
    get label() {
      return t("Fluid height");
    },
  },
  {
    value: "fixed-height",
    get label() {
      return t("Fixed height");
    },
  },
];

export function Hero() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <RadioGroupField
            label={t("Mode")}
            name={`${focusIdx}.attributes.mode`}
            options={options}
          />
          <Width />
          <Height />
          <Padding />
          <VerticalAlign />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Background")}>
        <Stack spacing={2}>
          <ImageUploaderField
            label={t("src")}
            name={`${focusIdx}.attributes.background-url`}
            helpText={t(
              "The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.",
            )}
            uploadHandler={onUploadImage}
          />

          <InputWithUnitField
            label={t("Background width")}
            name={`${focusIdx}.attributes.background-width`}
          />
          <InputWithUnitField
            label={t("Background height")}
            name={`${focusIdx}.attributes.background-height`}
          />
          <TextField
            label={t("Background position")}
            name={`${focusIdx}.attributes.background-position`}
          />
          <InputWithUnitField
            label={t("Border radius")}
            name={`${focusIdx}.attributes.border-radius`}
            unitOptions="percent"
          />
          <BackgroundColor />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
