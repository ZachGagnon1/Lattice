import React from "react";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { ClassName } from "@/adapters/panels/AttributePanel/components/attributes/ClassName";
import { Color } from "@/adapters/panels/AttributePanel/components/attributes/Color";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { FontSize } from "@/adapters/panels/AttributePanel/components/attributes/FontSize";
import { FontStyle } from "@/adapters/panels/AttributePanel/components/attributes/FontStyle";
import { FontWeight } from "@/adapters/panels/AttributePanel/components/attributes/FontWeight";
import { LetterSpacing } from "@/adapters/panels/AttributePanel/components/attributes/LetterSpacing";
import { LineHeight } from "@/adapters/panels/AttributePanel/components/attributes/LineHeight";
import { Link } from "@/adapters/panels/AttributePanel/components/attributes/Link";
import { MergeTagButton } from "@/adapters/panels/AttributePanel/components/attributes/MergeTagButton";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { TextDecoration } from "@/adapters/panels/AttributePanel/components/attributes/TextDecoration";
import { TextField } from "@/adapters/panels/common/Form";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { useEditorProps, useFocusIdx } from "@";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { Stack } from "@mui/material";

export function Button() {
  const { focusIdx } = useFocusIdx();
  const { input } = useEditorField<string>(`${focusIdx}.data.value.content`);

  const { variableData } = useEditorProps();

  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <TextField
            label={t("Content")}
            slotProps={{
              input: {
                endAdornment: variableData && (
                  <MergeTagButton
                    value={input.value}
                    onChange={input.onChange}
                  />
                ),
              },
            }}
            name={`${focusIdx}.data.value.content`}
          />
          <Link />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Width />
          <FontWeight />

          <Padding title={t("Padding")} attributeName="padding" showResetAll />
          <Padding title={t("Inner padding")} attributeName="inner-padding" />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Color")}>
        <Stack spacing={2}>
          <Color title={t("Text color")} />
          <BackgroundColor title={t("Button color")} />
          <ContainerBackgroundColor title={t("Background color")} />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Typography")}>
        <Stack spacing={2}>
          <FontFamily />
          <FontSize />
          <FontWeight />
          <LineHeight />
          <TextDecoration />
          <LetterSpacing />
          <Align />
          <FontStyle />
        </Stack>
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
