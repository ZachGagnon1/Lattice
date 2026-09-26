import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  InputLabel,
  Popover,
  Stack,
  TextField,
} from "@mui/material";
import { HexColorInput, HexColorPicker } from "react-colorful";
import Color from "color";
import { PresetColorsContext } from "@/extensions/AttributePanel/components/provider/PresetColorsProvider";

export interface ColorPickerProps {
  onChange?: (val: string) => void;
  value?: string;
  label?: string;
  showInput?: boolean;
  children?: React.ReactNode;
  container?: HTMLElement | (() => HTMLElement | null);
  isOpen?: boolean;
  onVisibilityChange?: (isOpen: boolean) => void;
}

const transparentColor = "rgba(0,0,0,0)";

export function ColorPicker(props: ColorPickerProps) {
  const {
    value = "",
    onChange,
    label,
    showInput = true,
    children,
    container,
    onVisibilityChange,
    isOpen: controlledIsOpen,
  } = props;

  const { colors: presetColors, addCurrentColor } =
    useContext(PresetColorsContext);

  // Internal state for when the component is used non-controlled
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [internalColor, setInternalColor] = useState(value);

  // Determine if we are currently open based on props or internal state
  const isPopoverOpen = controlledIsOpen ?? internalOpen;

  useEffect(() => {
    // Only overwrite internal color state if the picker isn't actively being edited
    if (!isPopoverOpen) {
      setInternalColor(value);
    }
  }, [value, isPopoverOpen]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    if (controlledIsOpen === undefined) {
      setInternalOpen(true);
    }
    onVisibilityChange?.(true);
  };

  const handleClose = useCallback(() => {
    if (controlledIsOpen === undefined) {
      setInternalOpen(false);
    }
    onVisibilityChange?.(false);
  }, [controlledIsOpen, onVisibilityChange]);

  const onColorChange = useCallback(
    (newColor: string) => {
      setInternalColor(newColor);
      onChange?.(newColor);
      addCurrentColor(newColor);
    },
    [addCurrentColor, onChange],
  );

  const adapterColor = useMemo(() => {
    try {
      if (internalColor.length === 6 && Color(`#${internalColor}`).hex()) {
        return `#${internalColor}`;
      }
    } catch (error) {}
    return internalColor;
  }, [internalColor]);

  // The toolbar passes a computed color such as `rgb(0, 0, 0)`, and the picker takes only hex.
  const pickerColor = useMemo(() => {
    try {
      return Color(adapterColor).hex();
    } catch (error) {
      return "#000000";
    }
  }, [adapterColor]);

  const inputColor = useMemo(() => {
    if (internalColor.startsWith("#") && internalColor.length === 7) {
      return internalColor.replace("#", "");
    }
    return internalColor;
  }, [internalColor]);

  const presetColorList = useMemo(() => {
    return presetColors.filter((item) => item !== transparentColor).slice(-14);
  }, [presetColors]);

  const childrenArray = React.Children.toArray(children);
  const triggerChild = childrenArray[0];
  const footerChild = childrenArray.length > 1 ? childrenArray[1] : null;

  return (
    <Stack spacing={0.5}>
      {label && !triggerChild && (
        <InputLabel sx={{ fontSize: "12px", color: "text.secondary" }}>
          {label}
        </InputLabel>
      )}
      <Box sx={{ display: "flex", width: "100%" }}>
        {triggerChild ? (
          <Box
            component="span"
            onClick={handleOpen}
            onMouseDown={(e) => e.preventDefault()}
            sx={{ display: "inline-flex", cursor: "pointer" }}
          >
            {triggerChild}
          </Box>
        ) : (
          <>
            <Button
              disableRipple
              onClick={handleOpen}
              sx={(theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: adapterColor || "transparent",
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
                borderTopRightRadius: showInput ? "0px" : "8px",
                borderBottomRightRadius: showInput ? "0px" : "8px",
                width: "40px",
                height: "40px",
                minWidth: "unset",
                p: 0,
              })}
            />
            {showInput && (
              <TextField
                size="small"
                value={inputColor}
                onChange={(e) => {
                  const val = e.target.value;
                  const formattedVal =
                    val && !val.startsWith("#") ? `#${val}` : val;
                  onColorChange(formattedVal);
                }}
                sx={{ flex: 1 }}
                slotProps={{
                  input: {
                    sx: {
                      borderTopLeftRadius: "0px",
                      borderBottomLeftRadius: "0px",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                    },
                  },
                }}
              />
            )}
          </>
        )}

        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          container={
            container
              ? typeof container === "function"
                ? container()
                : container
              : anchorEl?.ownerDocument.body
          }
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          sx={{ zIndex: 10000 }}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: "#FFFFFF",
                minHeight: "fit-content",
              },
            },
          }}
        >
          <Box
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Stack spacing={1} sx={{ p: 1.5, width: 200 }}>
              <HexColorPicker color={pickerColor} onChange={onColorChange} />
              <Box
                component={HexColorInput}
                color={pickerColor}
                onChange={onColorChange}
                prefixed
                aria-label="Hex color"
                sx={(theme) => ({
                  font: "inherit",
                  fontSize: "13px",
                  p: "6px 8px",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "4px",
                  textTransform: "uppercase",
                })}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {presetColorList.map((presetColor) => (
                  <Box
                    key={presetColor}
                    component="button"
                    type="button"
                    title={presetColor}
                    aria-label={presetColor}
                    onClick={() => onColorChange(presetColor)}
                    sx={(theme) => ({
                      width: 20,
                      height: 20,
                      p: 0,
                      cursor: "pointer",
                      backgroundColor: presetColor,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "4px",
                    })}
                  />
                ))}
              </Box>
            </Stack>
            {footerChild}
          </Box>
        </Popover>
      </Box>
    </Stack>
  );
}
