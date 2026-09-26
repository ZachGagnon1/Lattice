import React, { useMemo } from "react";
import { ColorPickerField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function BackgroundColor({
  title = t("Background color"),
}: {
  title?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.background-color`}
      />
    );
  }, [focusIdx, title]);
}
