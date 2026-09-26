import React from "react";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";

export interface AutoCompleteOption {
  value: string | number;
  label: string | number;
}

export interface AutoCompleteProps extends Omit<
  TextFieldProps,
  "onChange" | "value" | "classes"
> {
  value?: string | number;
  options: AutoCompleteOption[];
  onChange: (val: string) => void;
}

const filter = createFilterOptions<AutoCompleteOption>({
  stringify: (option) => `${option.label} ${option.value}`,
});

export function AutoComplete(props: Readonly<AutoCompleteProps>) {
  const {
    value = "",
    options,
    onChange,
    placeholder,
    disabled,
    sx,
    className,
    size,
    fullWidth,
    ...rest
  } = props;

  // Convert value to string to ensure safe strict equality matching
  const strValue = value !== undefined && value !== null ? String(value) : "";

  // Find the exact option object, or fallback to the raw typed string
  const selectedOption =
    options.find((opt) => String(opt.value) === strValue) ?? strValue;

  return (
    <Autocomplete
      freeSolo
      size={size}
      fullWidth={fullWidth}
      value={selectedOption}
      onChange={(
        _event: React.SyntheticEvent,
        newValue: string | AutoCompleteOption | null,
        reason: AutocompleteChangeReason,
      ) => {
        if (typeof newValue === "string") {
          onChange(newValue);
        } else if (newValue && typeof newValue === "object") {
          onChange(String(newValue.value));
        } else if (reason === "clear") {
          onChange("");
        }
      }}
      onInputChange={(
        _event: React.SyntheticEvent,
        newInputValue: string,
        reason: AutocompleteInputChangeReason,
      ) => {
        // reason === "input" ensures we only update when the user is physically typing.
        // It ignores "reset" events triggered internally by selecting an option.
        if (reason === "input") {
          onChange(newInputValue);
        }
      }}
      options={options}
      filterOptions={filter}
      getOptionLabel={(option: string | AutoCompleteOption) => {
        // Must handle the case where the value is a custom string (freeSolo)
        if (typeof option === "string") {
          return option;
        }
        return String(option.label ?? option.value);
      }}
      isOptionEqualToValue={(
        option: AutoCompleteOption,
        val: string | AutoCompleteOption,
      ) => {
        const valString = typeof val === "string" ? val : String(val.value);
        return String(option.value) === valString;
      }}
      disableClearable
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          size={size}
          fullWidth={fullWidth}
          placeholder={placeholder}
          sx={sx}
          className={className}
        />
      )}
    />
  );
}
