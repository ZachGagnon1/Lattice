import React from "react";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
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
