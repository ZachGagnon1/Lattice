import React from "react";
import { MenuItem, MenuList } from "@mui/material";
import { ToolItem } from "./ToolItem";
import { ToolbarPopover, useToolbarPopup } from "./ToolbarPopover";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
}

export interface DropdownToolProps {
  title: string;
  icon: React.ReactNode;
  options: DropdownOption[];
  /** The value of the checked option. */
  selected?: string;
  /** Shown in the button name, so a screen reader announces the current value. */
  currentLabel?: string;
  onSelect: (value: string) => void;
}

export function DropdownTool({
  title,
  icon,
  options,
  selected,
  currentLabel,
  onSelect,
}: Readonly<DropdownToolProps>) {
  const popup = useToolbarPopup();

  return (
    <>
      <ToolItem
        {...popup.triggerProps}
        title={currentLabel ? `${title}: ${currentLabel}` : title}
        icon={icon}
        isActive={popup.isOpen}
        aria-haspopup="menu"
      />
      <ToolbarPopover
        popup={popup}
        initialFocus={['[aria-checked="true"]', '[role="menuitemradio"]']}
        paperSx={{ sx: { maxWidth: 200, maxHeight: 350, overflowY: "auto" } }}
      >
        <MenuList aria-label={title} dense sx={{ py: 0 }}>
          {options.map((option) => (
            <MenuItem
              key={option.value}
              role="menuitemradio"
              aria-checked={option.value === selected}
              selected={option.value === selected}
              onClick={() => {
                popup.close();
                onSelect(option.value);
              }}
              sx={{ minHeight: 30, fontSize: 14 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </ToolbarPopover>
    </>
  );
}
