import React from "react";
import {
  Box,
  FormControlLabel,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
} from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";

export interface SwitchInputProps extends Omit<
  MuiSwitchProps,
  "onChange" | "value"
> {
  value?: boolean;
  checked?: boolean;
  onChange?: (val: boolean) => void;
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
}

export function SwitchInput(props: Readonly<SwitchInputProps>) {
  const { value, checked, onChange, label, helperText, error, ...rest } = props;

  // The enhancer passes both `value` and `checked`, so we safely fallback to either
  const isChecked = Boolean(checked ?? value ?? false);

  const muiSwitch = (
    <MuiSwitch
      {...rest}
      checked={isChecked}
      onChange={(e, newChecked) => {
        if (onChange) {
          onChange(newChecked);
        }
      }}
      size="small"
      color="primary"
    />
  );

  return (
    <Box>
      {label ? (
        <FormControlLabel
          control={muiSwitch}
          label={label}
          sx={{ margin: 0 }}
        />
      ) : (
        muiSwitch
      )}

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
}
