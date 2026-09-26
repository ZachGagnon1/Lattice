import React from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import {
  ColorPickerField,
  ImageUploaderField,
  SwitchField,
  TextField,
} from "@/adapters/panels/common/Form";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { Height } from "@/adapters/panels/AttributePanel/components/attributes/Height";
import { Link } from "@/adapters/panels/AttributePanel/components/attributes/Link";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";

import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { useEditorProps, useFocusIdx } from "@";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { imageHeightAdapter, pixelAdapter } from "../../adapter";
import { Stack } from "@mui/material";

const fullWidthOnMobileAdapter = {
  format: Boolean,
  parse(val: string) {
    if (!val) {
      return undefined;
    }

    return "true";
  },
};

export function Image() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <ImageUploaderField
            label={t("src")}
            labelHidden
            name={`${focusIdx}.attributes.src`}
            helpText={t(
              "The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.",
            )}
            uploadHandler={onUploadImage}
          />
          <ColorPickerField
            label={t("Background color")}
            name={`${focusIdx}.attributes.container-background-color`}
          />
          <SwitchField
            label={t("Full width on mobile")}
            name={`${focusIdx}.attributes.fluid-on-mobile`}
            config={fullWidthOnMobileAdapter}
          />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Width config={pixelAdapter} />

          <Height config={imageHeightAdapter} />

          <Padding showResetAll />

          <Align />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Link")}>
        <Link />
      </CollapsableItem>

      <CollapsableItem title={t("Border")}>
        <Border />
      </CollapsableItem>

      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <Stack spacing={2}>
          <TextField label={t("title")} name={`${focusIdx}.attributes.title`} />

          <TextField label={t("alt")} name={`${focusIdx}.attributes.alt`} />

          <TextField
            label={t("class name")}
            name={`${focusIdx}.attributes.css-class`}
          />
        </Stack>
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
