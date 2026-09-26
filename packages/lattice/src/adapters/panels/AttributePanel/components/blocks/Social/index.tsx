import React, { useMemo } from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import {
  EditGridTabField,
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  TextField,
} from "@/adapters/panels/common/Form";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { Color } from "@/adapters/panels/AttributePanel/components/attributes/Color";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { FontSize } from "@/adapters/panels/AttributePanel/components/attributes/FontSize";
import { FontStyle } from "@/adapters/panels/AttributePanel/components/attributes/FontStyle";
import { FontWeight } from "@/adapters/panels/AttributePanel/components/attributes/FontWeight";

import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { TextDecoration } from "@/adapters/panels/AttributePanel/components/attributes/TextDecoration";
import { LineHeight } from "@/adapters/panels/AttributePanel/components/attributes/LineHeight";
import { ISocial, useBlock, useEditorProps, useFocusIdx } from "@";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { InputAdornment, Stack } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

const options = [
  {
    value: "vertical",
    get label() {
      return t("vertical");
    },
  },
  {
    value: "horizontal",
    get label() {
      return t("horizontal");
    },
  },
];

export function Social() {
  const { focusIdx } = useFocusIdx();
  const { focusBlock } = useBlock();
  const value = focusBlock?.data.value as ISocial["data"]["value"];
  if (!value) {
    return null;
  }

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Setting")}>
        <RadioGroupField
          label={t("Mode")}
          name={`${focusIdx}.attributes.mode`}
          options={options}
        />

        <Align />
      </CollapsableItem>

      <CollapsableItem title={t("Typography")}>
        <Stack spacing={2}>
          <FontFamily />
          <FontSize />
          <FontWeight />
          <LineHeight />
          <Color />
          <ContainerBackgroundColor title={t("Background color")} />
          <TextDecoration />
          <FontStyle />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Social item")} defaultExpanded={false}>
        <EditGridTabField
          name={`${focusIdx}.data.value.elements`}
          label=""
          labelHidden
          renderItem={(item, index) => (
            <SocialElement item={item} index={index} />
          )}
        />
      </CollapsableItem>

      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <InputWithUnitField
            label={t("Icon width")}
            name={`${focusIdx}.attributes.icon-size`}
          />
          <TextField
            label={t("Border radius")}
            name={`${focusIdx}.attributes.border-radius`}
          />

          <Padding />
          <Padding attributeName="inner-padding" title={t("Icon padding")} />
          <Padding attributeName="text-padding" title={t("Text padding")} />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}

function SocialElement({
  index,
}: {
  item: ISocial["data"]["value"]["elements"][0];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage, socialIcons } = useEditorProps();

  const autoCompleteOptions = useMemo(() => {
    if (!socialIcons) {
      return undefined;
    }

    return socialIcons.map((icon) => {
      return {
        label: icon.content,
        value: icon.image,
      };
    });
  }, [socialIcons]);

  return (
    <Stack spacing={2}>
      <ImageUploaderField
        label={t("Image")}
        autoCompleteOptions={autoCompleteOptions}
        labelHidden
        name={`${focusIdx}.data.value.elements.[${index}].src`}
        uploadHandler={onUploadImage}
      />
      <TextField
        label={t("Content")}
        name={`${focusIdx}.data.value.elements.[${index}].content`}
      />

      <TextField
        label={t("Link")}
        name={`${focusIdx}.data.value.elements.[${index}].href`}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  );
}
