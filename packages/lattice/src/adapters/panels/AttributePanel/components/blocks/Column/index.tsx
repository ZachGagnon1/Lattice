import React from "react";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { VerticalAlign } from "@/adapters/panels/AttributePanel/components/attributes/VerticalAlign";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { BackgroundColor, ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function Column() {
  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Width />
          <VerticalAlign />
          <Padding />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Background")}>
        <BackgroundColor />
      </CollapsableItem>
      <CollapsableItem title={t("Border")}>
        <Border />
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
