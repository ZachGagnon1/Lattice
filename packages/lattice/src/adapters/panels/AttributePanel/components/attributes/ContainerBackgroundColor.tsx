import React, { useMemo } from "react";
import { ColorPickerField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function ContainerBackgroundColor({
  title = t("Container background color"),
}: {
  title?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <ColorPickerField
        label={title}
        name={`${focusIdx}.attributes.container-background-color`}
      />
    );
  }, [focusIdx, title]);
}
