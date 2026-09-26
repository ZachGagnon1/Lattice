import React, { useState } from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { TextDecoration } from "@/adapters/panels/AttributePanel/components/attributes/TextDecoration";
import { FontWeight } from "@/adapters/panels/AttributePanel/components/attributes/FontWeight";
import { FontStyle } from "@/adapters/panels/AttributePanel/components/attributes/FontStyle";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { Height } from "@/adapters/panels/AttributePanel/components/attributes/Height";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { FontSize } from "@/adapters/panels/AttributePanel/components/attributes/FontSize";
import { Color } from "@/adapters/panels/AttributePanel/components/attributes/Color";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { LineHeight } from "@/adapters/panels/AttributePanel/components/attributes/LineHeight";
import { LetterSpacing } from "@/adapters/panels/AttributePanel/components/attributes/LetterSpacing";
import CodeIcon from "@mui/icons-material/Code";

import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { HtmlEditor } from "../../UI/HtmlEditor";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { IconButton, Stack, Tooltip } from "@mui/material";

export function Text() {
  const [visible, setVisible] = useState(false);

  return (
    <AttributesPanelWrapper
      extra={
        <Tooltip title={t("Html mode")} placement="top">
          <IconButton
            onClick={() => setVisible(true)}
            size="small"
            sx={{ p: 0.5 }} // Keeps it tight and perfectly aligned with the header
          >
            <CodeIcon />
          </IconButton>
        </Tooltip>
      }
    >
      <CollapsableItem title={t("Dimension")}>
        <Height />
        <Padding showResetAll />
      </CollapsableItem>
      <CollapsableItem title={t("Color")}>
        <Stack spacing={2}>
          <Color />
          <ContainerBackgroundColor title={t("Background color")} />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Typography")}>
        <Stack spacing={2}>
          <FontFamily />
          <FontSize />
          <LineHeight />
          <LetterSpacing />
          <TextDecoration />
          <FontWeight />
          <Align />
          <FontStyle />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
      <HtmlEditor visible={visible} setVisible={setVisible} />
    </AttributesPanelWrapper>
  );
}
