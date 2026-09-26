import React from "react";
import { useFocusIdx } from "@";
import { RadioGroupField } from "../../../common/Form";

const options = [
  {
    value: "left",
    get label() {
      return t("left");
    },
  },
  {
    value: "center",
    get label() {
      return t("center");
    },
  },
  {
    value: "right",
    get label() {
      return t("right");
    },
  },
];

export function Align({ inline }: { inline?: boolean }) {
  const { focusIdx } = useFocusIdx();

  return (
    <RadioGroupField
      label={t("Align")}
      name={`${focusIdx}.attributes.align`}
      options={options}
    />
  );
}
