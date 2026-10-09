import React, { useMemo } from "react";
import { NumberField, TextField } from "@/adapters/panels/common/Form";
import { useFocusIdx } from "@";

import Stack from "@mui/material/Stack";
import { Text } from "@/adapters/ui/kit/Text";

export function Decoration() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack key={focusIdx} direction="column" spacing={1}>
        <Text size="md" weight="bold">
          {t("Decoration")}
        </Text>

        <TextField
          label={t("Border radius")}
          name={`${focusIdx}.attributes.borderRadius`}
        />

        <TextField label={t("Border")} name={`${focusIdx}.attributes.border`} />

        <NumberField
          label={t("Opacity")}
          max={1}
          min={0}
          step={0.1}
          name={`${focusIdx}.attributes.opacity`}
        />
      </Stack>
    );
  }, [focusIdx]);
}
