import { TextField, TextFieldProps } from "@mui/material";
import React, { useCallback } from "react";

export type TextInputProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onChange: (val: string) => void;
};

export function TextInput(props: TextInputProps) {
  const {
    value = "",
    onKeyDown: onPropsKeyDown,
    onChange: propsOnChange,
    ...rest
  } = props;

  const onChange = useCallback(
    (val: string) => {
      propsOnChange?.(val);
    },
    [propsOnChange],
  );

  return (
    <TextField
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      variant="outlined"
    />
  );
}
