import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { parseFontStack, joinFontStack } from "@/extensions/utils/fontStack";

export interface FontStackProps extends Omit<
  TextFieldProps,
  "onChange" | "value" | "classes"
> {
  value?: string;
  options: string[];
  onChange: (val: string) => void;
}

// The order sets the fallback order. The email client uses the first font it has.
export function FontStack(props: Readonly<FontStackProps>) {
  const {
    value,
    options,
    onChange,
    helperText = t(
      "Type a font and press Enter. The email client uses the first font it has.",
    ),
    placeholder,
    disabled,
    sx,
    className,
    size,
    fullWidth,
    ...rest
  } = props;

  return (
    <Autocomplete
      multiple
      freeSolo
      filterSelectedOptions
      size={size}
      fullWidth={fullWidth}
      options={options}
      value={parseFontStack(value)}
      onChange={(_event, fonts: string[]) => onChange(joinFontStack(fonts))}
      disabled={disabled}
      renderOption={(optionProps, option) => {
        const { key, ...restOption } = optionProps;
        return (
          <li key={key} {...restOption} style={{ fontFamily: option }}>
            {option}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          size={size}
          fullWidth={fullWidth}
          placeholder={placeholder}
          sx={sx}
          className={className}
          helperText={helperText}
        />
      )}
    />
  );
}
