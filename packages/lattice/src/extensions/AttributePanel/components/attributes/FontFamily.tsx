import React, { useMemo } from "react";
import { useFocusIdx } from "@";
import { FontStackField } from "../../../components/Form";
import { useFontFamily } from "@/extensions/hooks/useFontFamily";
import { fontStackOptions } from "@/extensions/utils/fontStack";

export function FontFamily({ name }: { name?: string }) {
  const { focusIdx } = useFocusIdx();
  const { fontList } = useFontFamily();

  const options = useMemo(
    () => fontStackOptions(fontList.map((font) => font.value)),
    [fontList],
  );

  return (
    <FontStackField
      label={t("Font family")}
      name={name ?? `${focusIdx}.attributes.font-family`}
      options={options}
    />
  );
}
