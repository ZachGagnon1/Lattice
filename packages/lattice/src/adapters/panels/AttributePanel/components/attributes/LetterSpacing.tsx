import React from "react";
import { InputWithUnitField } from "../../../common/Form";
import { useFocusIdx } from "@";

export function LetterSpacing({ name }: { name?: string }) {
  const { focusIdx } = useFocusIdx();

  return (
    <InputWithUnitField
      label={t("Letter spacing")}
      name={name || `${focusIdx}.attributes.letter-spacing`}
    />
  );
}
