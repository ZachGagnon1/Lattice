import React, { useMemo } from "react";
import { TextField } from "../../../common/Form";
import { Stack, Text, useFocusIdx } from "@";

export function Margin() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack vertical spacing="extraTight">
        <Text size="lg" weight="medium">
          {t("Margin")}
        </Text>
        <Stack wrap={false}>
          <Stack.Item fill>
            <TextField
              label={t("Top")}
              name={`${focusIdx}.attributes.marginTop`}
            />
          </Stack.Item>
          <Stack.Item fill>
            <TextField
              label={t("Bottom")}
              name={`${focusIdx}.attributes.marginBottom`}
            />
          </Stack.Item>
        </Stack>

        <Stack wrap={false}>
          <Stack.Item fill>
            <TextField
              label={t("Left")}
              name={`${focusIdx}.attributes.marginLeft`}
            />
          </Stack.Item>
          <Stack.Item fill>
            <TextField
              label={t("Right")}
              name={`${focusIdx}.attributes.marginRight`}
            />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }, [focusIdx]);
}
