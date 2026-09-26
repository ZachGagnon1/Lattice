import React, { useMemo } from "react";
import { TextField } from "../../../common/Form";
import { Stack, TextStyle, useFocusIdx } from "@";

export function Margin() {
  const { focusIdx } = useFocusIdx();

  return useMemo(() => {
    return (
      <Stack vertical spacing="extraTight">
        <TextStyle size="large">{t("Margin")}</TextStyle>
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
