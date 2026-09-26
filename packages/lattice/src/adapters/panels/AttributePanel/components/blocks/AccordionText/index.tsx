import React from "react";
import { useFocusIdx } from "@";

import {
  AttributesPanelWrapper,
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Padding,
  TextAreaField,
} from "@/adapters/panels";
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
