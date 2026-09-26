import React from "react";
import { InputWithUnitField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function LineHeight({ name }: { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={t("Line height")}
      unitOptions="percent"
      name={name || `${focusIdx}.attributes.line-height`}
    />
  );
}
