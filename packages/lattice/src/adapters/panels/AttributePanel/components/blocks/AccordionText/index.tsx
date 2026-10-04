import React from "react";
import { useFocusIdx } from "@";

import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import { Color } from "@/adapters/panels/AttributePanel/components/attributes/Color";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { FontSize } from "@/adapters/panels/AttributePanel/components/attributes/FontSize";
import { FontWeight } from "@/adapters/panels/AttributePanel/components/attributes/FontWeight";
import { LineHeight } from "@/adapters/panels/AttributePanel/components/attributes/LineHeight";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { TextAreaField } from "@/adapters/panels/common/Form";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function AccordionText() {
  const { focusIdx } = useFocusIdx();

  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <TextAreaField
            label={t("Content")}
            name={`${focusIdx}.data.value.content`}
          />

          <Color />

          <FontSize />

          <LineHeight />

          <FontWeight />

          <FontFamily />

          <BackgroundColor />

          <Padding title={t("Padding")} attributeName="padding" />
        </Stack>
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
