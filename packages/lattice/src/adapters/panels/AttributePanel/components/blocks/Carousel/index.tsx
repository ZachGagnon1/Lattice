import React from "react";
import {
  ColorPickerField,
  EditTabField,
  ImageUploaderField,
  InputWithUnitField,
  RadioGroupField,
  SelectField,
  TextField,
} from "@/adapters/panels/common/Form";
import { ICarousel, useEditorProps, useFocusIdx } from "@";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { InputAdornment, Stack } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

const options = [
  {
    value: "hidden",
    get label() {
      return t("hidden");
    },
  },
  {
    value: "visible",
    get label() {
      return t("visible");
    },
  },
];

export function Carousel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <InputWithUnitField
            label={t("Thumbnail width")}
            name={`${focusIdx}.attributes.tb-width`}
          />

          <RadioGroupField
            label={t("Thumbnails")}
            name={`${focusIdx}.attributes.thumbnails`}
            options={options}
          />
          <Align inline />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Images")}>
        <EditTabField
          name={`${focusIdx}.data.value.images`}
          label=""
          labelHidden
          renderItem={(item, index) => (
            <CarouselImage item={item} index={index} />
          )}
          additionItem={{
            src: "https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg",
            target: "_blank",
          }}
        />
      </CollapsableItem>
      <CollapsableItem title={t("Icon")}>
        <Stack spacing={2}>
          <TextField
            label={t("Left icon")}
            name={`${focusIdx}.attributes.left-icon`}
          />

          <TextField
            label={t("Right icon")}
            name={`${focusIdx}.attributes.right-icon`}
          />

          <InputWithUnitField
            label={t("Icon width")}
            name={`${focusIdx}.attributes.icon-width`}
          />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Border")}>
        <Stack spacing={2}>
          <ColorPickerField
            label={t("Hovered border")}
            name={`${focusIdx}.attributes.tb-hover-border-color`}
          />
          <ColorPickerField
            label={t("Selected Border")}
            name={`${focusIdx}.attributes.tb-selected-border-color`}
          />
          <TextField
            label={t("Border of the thumbnails")}
            name={`${focusIdx}.attributes.tb-border`}
          />
          <TextField
            label={t("Border radius of the thumbnails")}
            name={`${focusIdx}.attributes.tb-border-radius`}
          />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}

function CarouselImage({
  item,
  index,
}: {
  item: ICarousel["data"]["value"]["images"];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();
  return (
    <Stack spacing={2}>
      <ImageUploaderField
        label={t("Image")}
        labelHidden
        name={`${focusIdx}.data.value.images.[${index}].src`}
        helpText={t(
          "The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.",
        )}
        uploadHandler={onUploadImage}
      />

      <TextField
        label={t("Url")}
        name={`${focusIdx}.data.value.images.[${index}].href`}
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

      <SelectField
        label={t("Target")}
        name={`${focusIdx}.data.value.images.[${index}].target`}
        options={[
          {
            value: "",
            label: t("_self"),
          },
          {
            value: "_blank",
            label: t("_blank"),
          },
        ]}
      />

      <TextField
        label={t("Title")}
        name={`${focusIdx}.data.value.image.[${index}].title`}
      />
    </Stack>
  );
}
