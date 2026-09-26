import React, { useMemo } from "react";
import { useFocusIdx } from "@";
import { RadioGroupField } from "@/adapters/panels";

const options = [
  {
    value: "ltr",
    get label() {
      return t("ltr");
    },
  },
  {
    value: "rtl",
    get label() {
      return t("rtl");
    },
  },
];

export function Direction() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <RadioGroupField
        label={t("Direction")}
        name={`${focusIdx}.attributes.direction`}
        options={options}
      />
    );
  }, [focusIdx]);
}
