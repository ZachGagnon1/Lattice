import React from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { BorderWidth } from "@/adapters/panels/AttributePanel/components/attributes/BorderWidth";
import { BorderStyle } from "@/adapters/panels/AttributePanel/components/attributes/BorderStyle";
import { BorderColor } from "@/adapters/panels/AttributePanel/components/attributes/BorderColor";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";

import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function Divider() {
  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Width unitOptions="percent" />

          <Align />
          <Padding />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Border")}>
        <Stack spacing={2}>
          <BorderWidth />
          <BorderStyle />
          <BorderColor />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Background")}>
        <ContainerBackgroundColor title={t("Background")} />
      </CollapsableItem>

      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
