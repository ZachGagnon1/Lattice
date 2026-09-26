import React, { useCallback } from "react";
import { InputWithUnitField } from "../../../common/Form";
import { useFocusIdx, useBlock } from "@";
import { BasicType, getParentByIdx } from "@";
import { InputWithUnitProps } from "@/adapters/panels/common/Form/InputWithUnit";
import type { FieldAdapter } from "@/adapters/panels/common/Form/enhancer";

export function Width({
  inline = false,
  unitOptions,
  config,
}: {
  inline?: boolean;
  unitOptions?: InputWithUnitProps["unitOptions"];
  config?: FieldAdapter;
}) {
  const { focusIdx } = useFocusIdx();
  const { focusBlock, values } = useBlock();
  const parentType = getParentByIdx(values, focusIdx)?.type;

  const validate = useCallback(
    (val: string): string | undefined => {
      if (
        focusBlock?.type === BasicType.COLUMN &&
        parentType === BasicType.GROUP
      ) {
        return /(\d)*%/.test(val)
          ? undefined
          : t(
              "Column inside a group must have a width in percentage, not in pixel",
            );
      }
      return undefined;
    },
    [focusBlock?.type, parentType],
  );

  return (
    <InputWithUnitField
      validate={validate}
      label={t("Width")}
      inline={inline}
      name={`${focusIdx}.attributes.width`}
      unitOptions={unitOptions}
      config={config}
    />
  );
}
