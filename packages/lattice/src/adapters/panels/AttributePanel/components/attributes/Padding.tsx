import React, { useCallback, useEffect, useMemo } from "react";
import { InputWithUnitField } from "../../../common/Form";
import { createBlockDataByType, TextStyle, useBlock, useFocusIdx } from "@";
import { FormProvider, useForm } from "react-hook-form";
import { get } from "lodash-es";
import { pixelAdapter } from "../adapter";
import { IconButton, Stack, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface PaddingProps {
  title?: string;
  attributeName?: "padding" | "inner-padding" | "text-padding";
  name?: string;
  showResetAll?: boolean;
}
export function Padding(props: PaddingProps = {}) {
  const {
    title = t("Padding"),
    attributeName = "padding",
    name,
    showResetAll,
  } = props;
  const { focusBlock, change, values } = useBlock();
  const { focusIdx } = useFocusIdx();

  const type = focusBlock && focusBlock.type;

  const defaultConfig = useMemo(
    () => (type ? createBlockDataByType(type) : undefined),
    [type],
  );

  const paddingValue: string | undefined = useMemo(() => {
    if (name) {
      return get(values, name);
    }
    return focusBlock?.attributes[attributeName];
  }, [attributeName, focusBlock?.attributes, name, values]);

  const defaultPaddingValue: string | undefined = useMemo(() => {
    if (name) {
      return null;
    }
    return defaultConfig?.attributes[attributeName];
  }, [attributeName, defaultConfig?.attributes, name]);

  const paddingFormValues = useMemo(() => {
    const paddingList = paddingValue?.split(" ");
    const defaultPaddingList = defaultPaddingValue?.split(" ");

    const top = paddingList ? paddingList[0] : defaultPaddingList?.[0] || "";
    const right = paddingList ? paddingList[1] : defaultPaddingList?.[1] || "";
    const bottom = paddingList ? paddingList[2] : defaultPaddingList?.[2] || "";
    const left = paddingList ? paddingList[3] : defaultPaddingList?.[3] || "";

    return {
      top,
      left,
      bottom,
      right,
    };
  }, [defaultPaddingValue, paddingValue]);

  const onChancePadding = useCallback(
    (val: string) => {
      if (name) {
        change(name, val);
      } else {
        change(focusIdx + `.attributes[${attributeName}]`, val);
      }
    },
    [name, change, focusIdx, attributeName],
  );

  const onResetPadding = useCallback(() => {
    if (name) {
      change(name, "0px 0px 0px 0px");
    } else {
      change(focusIdx + `.attributes[${attributeName}]`, "0px 0px 0px 0px");
    }
  }, [name, change, focusIdx, attributeName]);

  const methods = useForm({ defaultValues: paddingFormValues });
  const { reset, watch } = methods;

  useEffect(() => {
    reset(paddingFormValues);
  }, [paddingFormValues, reset]);

  useEffect(() => {
    const { unsubscribe } = watch(({ top, right, bottom, left }, { type }) => {
      // Only a user edit writes back. A write on mount or reset made an extra undo step.
      if (type !== "change") return;
      onChancePadding([top, right, bottom, left].join(" "));
    });
    return unsubscribe;
  }, [onChancePadding, watch]);

  return (
    <FormProvider {...methods}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
          }}
          spacing={2}
        >
          <TextStyle variation="strong">{title}</TextStyle>
          {showResetAll && (
            <Tooltip title="Remove all padding" placement="top">
              <IconButton
                onClick={onResetPadding}
                size="small"
                sx={{ p: 0.5 }} // Keeps it tight like Arco's "mini"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
          }}
          spacing={2}
        >
          <InputWithUnitField
            label={t("Top (px)")}
            name="top"
            autoComplete="off"
            config={pixelAdapter}
          />
          <InputWithUnitField
            label={t("Left (px)")}
            name="left"
            autoComplete="off"
            config={pixelAdapter}
          />
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
          }}
          spacing={2}
        >
          <InputWithUnitField
            label={t("Bottom (px)")}
            name="bottom"
            config={pixelAdapter}
            autoComplete="off"
          />
          <InputWithUnitField
            label={t("Right (px)")}
            name="right"
            autoComplete="off"
            config={pixelAdapter}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
}
