import React, { useMemo } from "react";
import { useFocusIdx } from "@";
import { TextField } from "../../../common/Form";

export function ClassName() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <TextField
        label={t("Class name")}
        name={`${focusIdx}.attributes.css-class`}
      />
    );
  }, [focusIdx]);
}
