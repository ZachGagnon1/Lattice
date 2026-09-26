import React, { useMemo } from "react";
import {
  ImageUploaderField,
  SelectField,
  TextField,
} from "../../../common/Form";
import { useEditorProps, useFocusIdx } from "@";
import { BackgroundColor } from "./BackgroundColor";
import { Stack } from "@mui/material";

const backgroundRepeatOptions = [
  {
    value: "no-repeat",
    get label() {
      return t("No repeat");
    },
  },
  {
    value: "repeat",
    get label() {
      return t("Repeat");
    },
  },
  {
    value: "repeat-x",
    get label() {
      return t("Repeat X");
    },
  },
  {
    value: "repeat-y",
    get label() {
      return t("Repeat Y");
    },
  },
];

export function Background() {
  const { focusIdx } = useFocusIdx();
  const { onUploadImage } = useEditorProps();
  return useMemo(() => {
    return (
      <Stack spacing={2}>
        <ImageUploaderField
          label={t("Background image")}
          name={`${focusIdx}.attributes.background-url`}
          helpText={t(
            "The image suffix should be .jpg, jpeg, png, gif, etc. Otherwise, the picture may not be displayed normally.",
          )}
          uploadHandler={onUploadImage}
        />

        <Stack spacing={1} direction="row">
          <BackgroundColor />

          <SelectField
            label={t("Background repeat")}
            name={`${focusIdx}.attributes.background-repeat`}
            options={backgroundRepeatOptions}
          />
        </Stack>
        <TextField
          label={t("Background size")}
          name={`${focusIdx}.attributes.background-size`}
        />
      </Stack>
    );
  }, [focusIdx, onUploadImage]);
}
