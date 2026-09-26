import React, { useMemo } from "react";
import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { NumberInput } from "./NumberInput";

export interface InputWithUnitProps {
  value?: string | number;
  onChange: (val: string) => void;
  unitOptions?: Array<{ value: string; label: string }> | "default" | "percent";
  label?: React.ReactNode;
  size?: "small" | "medium";
  error?: boolean;
  helperText?: React.ReactNode;
  [key: string]: any;
}

const defaultUnitOptions = [{ value: "px", label: "px" }];

const percentUnitOptions = [
  { value: "px", label: "px" },
  { value: "%", label: "%" },
];

export function InputWithUnit(props: Readonly<InputWithUnitProps>) {
  const {
    value = "",
    label,
    onChange,
    unitOptions: propsUnitOptions,
    size = "small",
    ...restProps
  } = props;

  const options = useMemo(() => {
    if (propsUnitOptions === "percent") {
      return percentUnitOptions;
    }
    if (propsUnitOptions === "default") {
      return defaultUnitOptions;
    }
    return propsUnitOptions ?? [];
  }, [propsUnitOptions]);

  const strValue = String(value);
  const numMatch = strValue.match(/^-?\d*\.?\d+/);
  const numValue = numMatch ? Number(numMatch[0]) : null;
  const unitValue = numMatch ? strValue.replace(numMatch[0], "") : strValue;

  const currentUnit = unitValue || (options.length > 0 ? options[0].value : "");

  const handleNumberChange = (val: number | null) => {
    if (val === null || Number.isNaN(val)) {
      onChange("");
    } else {
      onChange(`${val}${currentUnit}`);
    }
  };

  const handleUnitChange = (e: SelectChangeEvent<string>) => {
    const newUnit = e.target.value;
    if (numValue === null) {
      onChange(newUnit);
    } else {
      onChange(`${numValue}${newUnit}`);
    }
  };

  if (options.length === 0) {
    return (
      <NumberInput
        {...restProps}
        label={label}
        size={size}
        value={numValue}
        onValueChange={handleNumberChange} // Swapped onChange for onValueChange
      />
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <NumberInput
        {...restProps}
        label={label}
        size={size}
        value={numValue}
        onValueChange={handleNumberChange} // Swapped onChange for onValueChange
        style={{
          flex: 1,
          borderBottomRightRadius: "0px !important",
          borderTopRightRadius: "0px !important",
        }}
        noRightBorder
      />
      <Select
        value={currentUnit}
        onChange={handleUnitChange}
        size={size}
        sx={{
          width: "70px",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          ml: "-1px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderLeftColor: "transparent",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderLeftColor: "transparent",
          },
          "&.Mui-focused": {
            zIndex: 1,
            "& .MuiOutlinedInput-notchedOutline": {
              borderLeftColor: "primary.main",
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
