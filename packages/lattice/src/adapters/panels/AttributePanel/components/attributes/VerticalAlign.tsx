import React, { useMemo } from "react";
import { useFocusIdx } from "@";
import { SelectField } from "../../../common/Form";

const options = [
  {
    value: "top",
    get label() {
      return t("top");
    },
  },
  {
    value: "middle",
    get label() {
      return t("middle");
    },
  },
  {
    value: "bottom",
    get label() {
      return t("bottom");
    },
  },
];

export function VerticalAlign({
  attributeName = "vertical-align",
}: {
  attributeName?: string;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <SelectField
        label={t("Vertical align")}
        name={`${focusIdx}.attributes.${attributeName}`}
        options={options}
      />
    );
  }, [attributeName, focusIdx]);
}
