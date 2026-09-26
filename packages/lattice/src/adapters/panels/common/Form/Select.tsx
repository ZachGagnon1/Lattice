import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  SxProps,
  Theme,
} from "@mui/material";
import React from "react";

export interface SelectProps {
  options: Array<{ value: string; label: React.ReactNode }>;
  onChange?: (val: string) => void;
  value: string;
  label?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export function Select({
  options,
  onChange,
  value,
  label,
  fullWidth = true,
  sx,
  disabled,
}: Readonly<SelectProps>) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange?.(event.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} sx={sx} disabled={disabled} size="small">
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect
        size="small"
        value={value}
        onChange={handleChange}
        label={label}
      >
        {options.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
