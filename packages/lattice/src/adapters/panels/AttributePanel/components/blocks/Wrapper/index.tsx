import React from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { Background } from "@/adapters/panels/AttributePanel/components/attributes/Background";
import { TextField } from "@/adapters/panels/common/Form";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { useFocusIdx } from "@";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function Wrapper() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Dimension")}>
        <Padding />
      </CollapsableItem>
      <CollapsableItem title={t("Background")}>
        <Background />
      </CollapsableItem>
      <CollapsableItem title={t("Border")}>
        <Stack spacing={2}>
          <TextField
            label={t("Border")}
            name={`${focusIdx}.attributes.border`}
          />
          <TextField
            label={t("Background border radius")}
            name={`${focusIdx}.attributes.border-radius`}
          />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
