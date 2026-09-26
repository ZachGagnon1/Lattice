import React from "react";
import { useEditorProps, useFocusIdx } from "@";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import {
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  SelectField,
  TextField,
} from "@/adapters/panels/common/Form";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

const positionOptions = [
  {
    value: "left",
    get label() {
      return t("Left");
    },
  },
  {
    value: "right",
    get label() {
      return t("Right");
    },
  },
];

const alignOptions = [
  {
    value: "top",
    get label() {
      return t("top");
    },
  },
  {
    value: "middle",
    get label() {
      return t("middle");
    },
  },
  {
    value: "bottom",
    get label() {
      return t("bottom");
    },
  },
];

export function Accordion() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <BackgroundColor />
          <FontFamily />

          <Padding />

          <InputWithUnitField
            label={t("Icon width")}
            name={`${focusIdx}.attributes.icon-width`}
          />

          <InputWithUnitField
            label={t("Icon height")}
            name={`${focusIdx}.attributes.icon-height`}
          />

          <ImageUploaderField
            label={t("Unwrapped icon")}
            name={`${focusIdx}.attributes.icon-unwrapped-url`}
            uploadHandler={onUploadImage}
          />
          <ImageUploaderField
            label={t("Wrapped icon")}
            name={`${focusIdx}.attributes.icon-wrapped-url`}
            uploadHandler={onUploadImage}
          />
          <RadioGroupField
            label={t("Icon position")}
            name={`${focusIdx}.attributes.icon-position`}
            options={positionOptions}
          />
          <SelectField
            style={{ width: 120 }}
            label={t("Icon align")}
            name={`${focusIdx}.attributes.icon-align`}
            options={alignOptions}
          />

          <TextField
            label={t("Border")}
            name={`${focusIdx}.attributes.border`}
          />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
