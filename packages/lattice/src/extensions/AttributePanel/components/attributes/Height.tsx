import React, { useMemo } from "react";
import { InputWithUnitField } from "@/extensions";
import { useFocusIdx } from "@";
import type { FieldAdapter } from "@/extensions/components/Form/enhancer";

export function Height({
  inline,
  config,
}: {
  inline?: boolean;
  config?: FieldAdapter;
}) {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <InputWithUnitField
        label={t("Height")}
        name={`${focusIdx}.attributes.height`}
        inline={inline}
        config={config}
      />
    );
  }, [focusIdx, inline]);
}
