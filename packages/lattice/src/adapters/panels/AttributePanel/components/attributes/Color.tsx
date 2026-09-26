import React from "react";
import { ColorPickerField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function Color({
  title = t("Color"),
}: {
  title?: string;
  inline?: boolean;
}) {
  const { focusIdx } = useFocusIdx();

  return (
    <ColorPickerField label={title} name={`${focusIdx}.attributes.color`} />
  );
}
