import React from "react";
import {
  Align,
  AttributesPanelWrapper,
  ColorPickerField,
  Padding,
  Stack,
  TextField,
  t,
  useFocusIdx,
} from "lattice";

export function CouponPanel() {
  const { focusIdx } = useFocusIdx();

  return (
    <AttributesPanelWrapper>
      <Stack vertical spacing="loose">
        <TextField label={t("Title")} name={`${focusIdx}.data.value.title`} />
        <TextField label={t("Code")} name={`${focusIdx}.data.value.code`} />
        <TextField label={t("Note")} name={`${focusIdx}.data.value.note`} />
        <ColorPickerField
          label={t("Text color")}
          name={`${focusIdx}.attributes.color`}
        />
        <ColorPickerField
          label={t("Background color")}
          name={`${focusIdx}.attributes.background-color`}
        />
        <ColorPickerField
          label={t("Border color")}
          name={`${focusIdx}.attributes.border-color`}
        />
        <Align />
        <Padding />
      </Stack>
    </AttributesPanelWrapper>
  );
}
