import React from "react";
import { useEditorProps, useFocusIdx } from "@";
import { SelectField, TextField } from "../../../common/Form";
import { MergeTagButton } from "./MergeTagButton";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { Stack } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import LinkIcon from "@mui/icons-material/Link";

export function Link() {
  const { focusIdx } = useFocusIdx();
  const { input } = useEditorField<string>(`${focusIdx}.attributes.href`);
  const { variableData } = useEditorProps();

  return (
    <Stack spacing={1} direction="row">
      <TextField
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
            endAdornment: variableData && (
              <MergeTagButton value={input.value} onChange={input.onChange} />
            ),
          },
        }}
        label={t("Href")}
        name={`${focusIdx}.attributes.href`}
      />
      <SelectField
        label={t("Target")}
        name={`${focusIdx}.attributes.target`}
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
    </Stack>
  );
}
