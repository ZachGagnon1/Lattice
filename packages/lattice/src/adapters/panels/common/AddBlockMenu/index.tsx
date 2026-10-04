import React, { useMemo } from "react";
import {
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  BasicType,
  BlockManager,
  IBlockData,
  useBlock,
  useEditorProps,
  useFocusIdx,
} from "@";
import { getIconNameByBlockType } from "@/shared/utils/panel/getIconNameByBlockType";
import {
  ExtensionProps,
  useExtensionProps,
} from "@/adapters/panels/common/Providers/ExtensionProvider";
import { resolveAddTarget } from "@/shared/utils/panel/resolveAddTarget";

export interface AddBlockMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  /** The element that holds the menu portal. Pass the iframe body when the trigger is in the iframe. */
  container?: HTMLElement;
}

interface AddBlockItem {
  key: string;
  label: string;
  type: string;
  payload?: Partial<IBlockData>;
}

interface AddBlockGroup {
  label: string;
  items: AddBlockItem[];
}

function sectionWithColumns(widths: string[]): Partial<IBlockData> {
  return {
    type: BasicType.SECTION,
    attributes: {},
    children: widths.map((width) => ({
      type: BasicType.COLUMN,
      attributes: { width },
      data: { value: {} },
      children: [],
    })),
  };
}

function toGroups(categories: ExtensionProps["categories"]): AddBlockGroup[] {
  return categories.flatMap((category): AddBlockGroup[] => {
    if (category.displayType === "column") {
      const items = category.blocks.flatMap((block) => {
        const [widths] = (block.payload ?? []) as string[][];
        if (!widths) return [];
        const label = block.title ?? "";
        return [
          {
            key: label,
            label,
            type: BasicType.SECTION,
            payload: sectionWithColumns(widths),
          },
        ];
      });
      return [{ label: category.label, items }];
    }
    if (
      category.displayType === "custom" ||
      category.displayType === "widget"
    ) {
      return [];
    }
    const items = category.blocks.map((block, index) => ({
      key: `${block.type}-${index}`,
      label:
        block.title ??
        BlockManager.getBlockByType(block.type)?.name ??
        block.type,
      type: block.type,
      payload: block.payload as Partial<IBlockData> | undefined,
    }));
    return [{ label: category.label, items }];
  });
}

// The menu adds a block with a click or the keyboard, for compact mode and for users who cannot drag.
export function AddBlockMenu({
  anchorEl,
  onClose,
  container,
}: Readonly<AddBlockMenuProps>) {
  const { categories } = useExtensionProps();
  const { values, addBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { autoComplete = false } = useEditorProps();

  const groups = useMemo(() => toGroups(categories), [categories]);
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      container={container}
      slotProps={{ paper: { sx: { maxHeight: 360 } } }}
    >
      {open &&
        groups.flatMap((group) => [
          <ListSubheader key={`group-${group.label}`}>
            {group.label}
          </ListSubheader>,
          ...group.items.map((item) => {
            const target = resolveAddTarget({
              type: item.type,
              focusIdx,
              values,
              autoComplete,
            });
            return (
              <MenuItem
                key={item.key}
                disabled={!target}
                onClick={() => {
                  if (!target) return;
                  addBlock({
                    type: item.type,
                    payload: item.payload,
                    ...target,
                  });
                  onClose();
                }}
              >
                <ListItemIcon>{getIconNameByBlockType(item.type)}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            );
          }),
        ])}
    </Menu>
  );
}
