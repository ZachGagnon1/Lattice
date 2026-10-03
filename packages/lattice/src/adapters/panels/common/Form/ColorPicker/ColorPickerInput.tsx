import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { HexColorPicker } from "react-colorful";
import Color from "color";
import { PresetColorsContext } from "@/adapters/panels/AttributePanel/components/provider/PresetColorsProvider";
import { debounce } from "lodash-es";
import { describeColor, toHexColor } from "@/shared/utils/colorName";
import { getColorControlLabel } from "@/shared/utils/controlAccessibility";

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

export interface ColorPickerPanelProps {
  value: string;
  onChange: (color: string) => void;
  /** Runs on a swatch click and on Enter in the hex field, for a picker that applies at once. */
  onPick?: (color: string) => void;
  label?: string;
}

const hexPattern = /^#?[0-9a-f]{6}$/i;

export function ColorPickerPanel(props: ColorPickerPanelProps) {
  const { value, onChange, onPick, label } = props;
  const { colors: presetColors } = useContext(PresetColorsContext);
  const lastValidHex = useRef("#000000");

  const presetColorList = useMemo(() => {
    return presetColors.filter((item) => item !== transparentColor).slice(-14);
  }, [presetColors]);

  // HexColorPicker needs a valid hex, but the value can be a partial hex while the user types.
  let pickerColor = lastValidHex.current;
  try {
    pickerColor = Color(
      hexPattern.test(value) && !value.startsWith("#") ? `#${value}` : value,
    ).hex();
    lastValidHex.current = pickerColor;
  } catch (error) {}

  return (
    <Stack spacing={1} sx={{ p: 1.5, width: 200 }}>
      <HexColorPicker color={pickerColor} onChange={onChange} />
      <TextField
        size="small"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next && !next.startsWith("#") ? `#${next}` : next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && onPick) {
            event.preventDefault();
            onPick(value);
          }
        }}
        aria-label={`${label || t("Color")} hex value`}
        sx={(theme) => ({
          "& input": {
            fontSize: "13px",
            textTransform: "uppercase",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
        })}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {presetColorList.map((presetColor) => (
          <Box
            key={presetColor}
            component="button"
            type="button"
            title={presetColor}
            aria-label={describeColor(toHexColor(presetColor)) || presetColor}
            onClick={() => {
              onChange(presetColor);
              onPick?.(presetColor);
            }}
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
  );
}

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

  const { addCurrentColor } = useContext(PresetColorsContext);

  // Internal state for when the component is used non-controlled
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [internalColor, setInternalColor] = useState(value);
  const triggerId = React.useId();
  const inputId = React.useId();
  const popoverId = React.useId();

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
    requestAnimationFrame(() => anchorEl?.focus());
  }, [anchorEl, controlledIsOpen, onVisibilityChange]);

  const commitColor = useCallback(
    (newColor: string) => {
      onChange?.(newColor);
      addCurrentColor(newColor);
    },
    [addCurrentColor, onChange],
  );

  const debouncedCommitColor = useMemo(
    () => debounce(commitColor, 300),
    [commitColor],
  );

  useEffect(() => () => debouncedCommitColor.cancel(), [debouncedCommitColor]);

  const onColorChange = useCallback(
    (newColor: string) => {
      setInternalColor(newColor);
      debouncedCommitColor(newColor);
    },
    [debouncedCommitColor],
  );

  const adapterColor = useMemo(() => {
    try {
      if (internalColor.length === 6 && Color(`#${internalColor}`).hex()) {
        return `#${internalColor}`;
      }
    } catch (error) {}
    return internalColor;
  }, [internalColor]);

  const inputColor = useMemo(() => {
    if (internalColor.startsWith("#") && internalColor.length === 7) {
      return internalColor.replace("#", "");
    }
    return internalColor;
  }, [internalColor]);

  const childrenArray = React.Children.toArray(children);
  const triggerChild = childrenArray[0];
  const triggerElement = React.isValidElement<{
    onClick?: React.MouseEventHandler<HTMLElement>;
    [key: string]: any;
  }>(triggerChild)
    ? triggerChild
    : null;
  const footerChild = childrenArray.length > 1 ? childrenArray[1] : null;
  const controlLabel = getColorControlLabel(label, internalColor);
  const triggerProps = {
    id: triggerId,
    "aria-label": controlLabel,
    "aria-controls": isPopoverOpen ? popoverId : undefined,
    "aria-expanded": isPopoverOpen,
    "aria-haspopup": "dialog" as const,
    onClick: handleOpen,
  };

  return (
    <Stack spacing={0.5}>
      {label && !triggerChild && (
        <InputLabel
          htmlFor={showInput ? inputId : triggerId}
          sx={{ fontSize: "12px", color: "text.secondary" }}
        >
          {label}
        </InputLabel>
      )}
      <Box sx={{ display: "flex", width: "100%" }}>
        {triggerChild ? (
          triggerElement ? (
            React.cloneElement(triggerElement, {
              ...triggerProps,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                triggerElement.props.onClick?.(event);
                handleOpen(event);
              },
              onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
                triggerElement.props.onMouseDown?.(event);
                event.preventDefault();
              },
            })
          ) : (
            <Button {...triggerProps}>{triggerChild}</Button>
          )
        ) : (
          <>
            <Button
              {...triggerProps}
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
                id={inputId}
                label={label || t("Color")}
                size="small"
                value={inputColor}
                onChange={(e) => {
                  const val = e.target.value;
                  const formattedVal =
                    val && !val.startsWith("#") ? `#${val}` : val;
                  setInternalColor(formattedVal);
                  debouncedCommitColor(formattedVal);
                }}
                sx={{ flex: 1 }}
                slotProps={{
                  htmlInput: { "aria-label": controlLabel },
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
          id={popoverId}
          role="dialog"
          aria-label={`${label || t("Color")} picker`}
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
            <ColorPickerPanel
              value={internalColor}
              onChange={onColorChange}
              label={label}
            />
            {footerChild}
          </Box>
        </Popover>
      </Box>
    </Stack>
  );
}
