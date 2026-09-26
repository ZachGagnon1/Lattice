import React from "react";
import { Height } from "@/adapters/panels/AttributePanel/components/attributes/Height";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function Spacer() {
  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Height />
          <Padding />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Background")}>
        <ContainerBackgroundColor title={t("Background color")} />
      </CollapsableItem>

      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
