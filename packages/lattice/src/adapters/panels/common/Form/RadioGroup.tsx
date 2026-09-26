import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup as MuiRadioGroup,
  SxProps,
} from "@mui/material";
import { merge } from "lodash-es";
import React from "react";
import FormHelperText from "@mui/material/FormHelperText";

export interface RadioGroupProps {
  options: Array<{ value: string; label: React.ReactNode }>;
  onChange: (value: string) => void;
  value?: string;
  type?: "radio" | "button";
  vertical?: boolean;
  name?: string;
  row?: boolean;
  size?: "small" | "medium";
  disabled?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  sx?: SxProps;
}

export function RadioGroup(props: Readonly<RadioGroupProps>) {
  const {
    type,
    vertical,
    options,
    onChange,
    value,
    label,
    sx,
    disabled,
    error,
    helperText,
    ...rest
  } = props;

  const rowLayout = vertical ? false : (rest.row ?? true);

  return (
    <FormControl sx={sx} disabled={disabled} error={error}>
      {label && <FormLabel>{label}</FormLabel>}
      <MuiRadioGroup
        {...rest}
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        row={rowLayout}
        sx={merge({ width: "100%" }, sx)}
      >
        {options.map((item, index) => (
          <FormControlLabel
            key={item.value ?? index}
            value={item.value}
            control={<Radio color="primary" />}
            label={item.label}
          />
        ))}
      </MuiRadioGroup>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
