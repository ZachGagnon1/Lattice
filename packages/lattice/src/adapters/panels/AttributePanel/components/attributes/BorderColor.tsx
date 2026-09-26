import React, { useMemo } from "react";
import { ColorPickerField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function BorderColor() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={t("Color")}
        name={`${focusIdx}.attributes.border-color`}
      />
    );
  }, [focusIdx]);
}
