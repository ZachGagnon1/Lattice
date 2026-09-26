import React from "react";
import { TextField, Button, Box, TextFieldProps } from "@mui/material";

export interface SearchInputProps extends Omit<
  TextFieldProps,
  "onChange" | "value"
> {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  searchButton?: React.ReactNode;
}

export function SearchInput(props: SearchInputProps) {
  const {
    value = "",
    onChange,
    onSearch,
    searchButton = "Apply", // Fallback if no button text is passed
    size = "small",
    label,
    ...rest
  } = props;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Triggers the search action when the user presses Enter
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <TextField
        {...rest}
        label={label}
        size={size}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        variant="outlined"
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            // Strip the right border-radius so it connects to the button seamlessly
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        disableElevation
        onClick={handleSearch}
        sx={{
          // Strip the left border-radius to attach it to the TextField
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          // Matches the standard heights of MUI inputs perfectly
          height: size === "small" ? "40px" : "56px",
          // Prevents the button from looking detached if the user hovers the text input
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        }}
      >
        {searchButton}
      </Button>
    </Box>
  );
}
