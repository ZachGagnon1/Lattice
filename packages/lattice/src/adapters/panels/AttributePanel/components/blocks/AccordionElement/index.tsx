import React from "react";
import {
  AttributesPanelWrapper,
  BackgroundColor,
  Border,
  FontFamily,
} from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function AccordionElement() {
  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <Border />
          <BackgroundColor />
          <FontFamily />
        </Stack>
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
