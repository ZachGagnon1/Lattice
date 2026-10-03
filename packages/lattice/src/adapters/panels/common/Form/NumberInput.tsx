import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
  return null;
}
SSRInitialFilled.muiName = "Input";

export interface NumberFieldProps extends BaseNumberField.Root.Props {
  label?: React.ReactNode;
  size?: "small" | "medium";
  error?: boolean;
  helperText?: React.ReactNode;
  noRightBorder?: boolean;
}

export function NumberInput({
  id: idProp,
  label,
  error,
  helperText,
  size = "medium",
  ...other
}: Readonly<NumberFieldProps>) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const helperTextId = helperText ? `${id}-helper-text` : undefined;

  return (
    <BaseNumberField.Root
      {...other}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="outlined"
        >
          {props.children}
        </FormControl>
      )}
    >
      <SSRInitialFilled {...other} />
      <InputLabel id={labelId} htmlFor={id}>
        {label}
      </InputLabel>
      <BaseNumberField.Input
        id={id}
        aria-describedby={helperTextId}
        aria-invalid={error || undefined}
        render={(props, state) => (
          <OutlinedInput
            label={label}
            inputRef={props.ref}
            value={state.inputValue}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            slotProps={{
              input: props,
            }}
            endAdornment={
              <InputAdornment
                position="end"
                sx={{
                  flexDirection: "column",
                  maxHeight: "unset",
                  alignSelf: "stretch",
                  borderLeft: "1px solid",
                  borderColor: "divider",
                  ml: 0,
                  "& button": {
                    py: 0,
                    flex: 1,
                    borderRadius: 0.5,
                  },
                }}
              >
                <BaseNumberField.Increment
                  render={
                    <IconButton
                      size={size}
                      aria-label="Increase"
                      aria-controls={id}
                    />
                  }
                >
                  <KeyboardArrowUpIcon
                    fontSize={size}
                    sx={{ transform: "translateY(2px)" }}
                  />
                </BaseNumberField.Increment>

                <BaseNumberField.Decrement
                  render={
                    <IconButton
                      size={size}
                      aria-label="Decrease"
                      aria-controls={id}
                    />
                  }
                >
                  <KeyboardArrowDownIcon
                    fontSize={size}
                    sx={{ transform: "translateY(-2px)" }}
                  />
                </BaseNumberField.Decrement>
              </InputAdornment>
            }
            sx={{
              pr: 0,
              borderBottomRightRadius: other.noRightBorder ? "0px" : undefined,
              borderTopRightRadius: other.noRightBorder ? "0px" : undefined,
            }}
          />
        )}
      />
      <FormHelperText id={helperTextId} sx={{ ml: 0, "&:empty": { mt: 0 } }}>
        {helperText}
      </FormHelperText>
    </BaseNumberField.Root>
  );
}
