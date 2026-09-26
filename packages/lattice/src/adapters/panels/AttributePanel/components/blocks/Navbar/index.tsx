import React from "react";
import {
  ColorPickerField,
  EditTabField,
  SelectField,
  TextField,
} from "@/adapters/panels/common/Form";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { NavbarLinkPadding } from "@/adapters/panels/AttributePanel/components/attributes/NavbarLinkPadding";
import { INavbar, useFocusIdx } from "@";
import {
  ClassName,
  FontFamily,
  FontStyle,
  FontWeight,
  LetterSpacing,
  LineHeight,
  TextDecoration,
  TextTransform,
} from "@/adapters/panels";
import { pixelAdapter } from "../../adapter";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { InputAdornment, Stack } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

export function Navbar() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Layout")}>
        <Align />
      </CollapsableItem>

      <CollapsableItem title={t("Navbar links")}>
        <Stack spacing={2}>
          <EditTabField
            name={`${focusIdx}.data.value.links`}
            label={t("Links")}
            labelHidden
            renderItem={(item, index) => (
              <NavbarLink item={item} index={index} />
            )}
            additionItem={{
              src: "https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg",
              target: "_blank",
              content: "New link",
              color: "#1890ff",
              "font-size": "13px",
            }}
          />
          <div />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Extra")}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}

function NavbarLink({
  item,
  index,
}: {
  item: INavbar["data"]["value"]["links"];
  index: number;
}) {
  const { focusIdx } = useFocusIdx();
  return (
    <div className="NavbarLink">
      <Stack spacing={2}>
        <TextField
          label={t("Content")}
          name={`${focusIdx}.data.value.links.[${index}].content`}
        />

        <ColorPickerField
          label={t("Color")}
          name={`${focusIdx}.data.value.links.[${index}].color`}
        />

        <FontFamily
          name={`${focusIdx}.data.value.links.[${index}].font-family`}
        />

        <TextField
          label={t("Font size (px)")}
          name={`${focusIdx}.data.value.links.[${index}].font-size`}
          config={pixelAdapter}
          autoComplete="off"
        />

        <LineHeight
          name={`${focusIdx}.data.value.links.[${index}].line-height`}
        />

        <LetterSpacing
          name={`${focusIdx}.data.value.links.[${index}].letter-spacing`}
        />

        <TextDecoration
          name={`${focusIdx}.data.value.links.[${index}].text-decoration`}
        />

        <FontWeight
          name={`${focusIdx}.data.value.links.[${index}].font-weight`}
        />

        <TextTransform
          name={`${focusIdx}.data.value.links.[${index}].text-transform`}
        />

        <FontStyle
          name={`${focusIdx}.data.value.links.[${index}].font-style`}
        />

        <TextField
          label={<span>{t("Url")}</span>}
          name={`${focusIdx}.data.value.links.[${index}].href`}
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
          style={{ minWidth: 65 }}
          label={t("Target")}
          name={`${focusIdx}.data.value.links.[${index}].target`}
          options={[
            {
              value: "_blank",
              label: t("_blank"),
            },
            {
              value: "_self",
              label: t("_self"),
            },
          ]}
        />

        <NavbarLinkPadding
          key={index}
          name={`${focusIdx}.data.value.links.[${index}].padding`}
        />
      </Stack>
    </div>
  );
}
