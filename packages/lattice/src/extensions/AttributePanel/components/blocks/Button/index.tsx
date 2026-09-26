import React, { useState } from "react";
import {
  Align,
  AttributesPanelWrapper,
  BackgroundColor,
  Border,
  ClassName,
  Color,
  ContainerBackgroundColor,
  FontFamily,
  FontSize,
  FontStyle,
  FontWeight,
  LetterSpacing,
  LineHeight,
  Link,
  MergeTags,
  Padding,
  TextDecoration,
  TextField,
  Width,
} from "@/extensions";
import { useEditorProps, useFocusIdx } from "@";
import { useEditorField } from "@/extensions/components/Form/useEditorField";
import { CollapsableItem } from "@/extensions/components/Collapse/CollapsableItem";
import { Box, IconButton, Popover, Stack } from "@mui/material";
import DataObjectIcon from "@mui/icons-material/DataObject";

export function Button() {
  const { focusIdx } = useFocusIdx();
  const { input } = useEditorField<string>(`${focusIdx}.data.value.content`);

  const { variableData } = useEditorProps();

  // MUI Popover requires local state to anchor the popup to the button
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "merge-tags-popover" : undefined;

  return (
    <AttributesPanelWrapper>
      <CollapsableItem title={t("Setting")}>
        <Stack spacing={2}>
          <TextField
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>{t("Content")}</span>
                {variableData && (
                  <>
                    <IconButton
                      aria-describedby={id}
                      onClick={handleClick}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <DataObjectIcon />
                    </IconButton>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                    >
                      <Box sx={{ p: 1 }}>
                        <MergeTags
                          value={input.value}
                          onChange={input.onChange}
                        />
                      </Box>
                    </Popover>
                  </>
                )}
              </Box>
            }
            name={`${focusIdx}.data.value.content`}
          />
          <Link />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <Width />
          <FontWeight />

          <Padding title={t("Padding")} attributeName="padding" showResetAll />
          <Padding title={t("Inner padding")} attributeName="inner-padding" />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Color")}>
        <Stack spacing={2}>
          <Color title={t("Text color")} />
          <BackgroundColor title={t("Button color")} />
          <ContainerBackgroundColor title={t("Background color")} />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Typography")}>
        <Stack spacing={2}>
          <FontFamily />
          <FontSize />
          <FontWeight />
          <LineHeight />
          <TextDecoration />
          <LetterSpacing />
          <Align />
          <FontStyle />
        </Stack>
      </CollapsableItem>

      <CollapsableItem title={t("Border")}>
        <Border />
      </CollapsableItem>
      <CollapsableItem title={t("Extra")} defaultExpanded={false}>
        <ClassName />
      </CollapsableItem>
    </AttributesPanelWrapper>
  );
}
