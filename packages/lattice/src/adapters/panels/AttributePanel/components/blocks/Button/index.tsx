import React, { useState } from "react";
import { Align } from "@/adapters/panels/AttributePanel/components/attributes/Align";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/BackgroundColor";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { ClassName } from "@/adapters/panels/AttributePanel/components/attributes/ClassName";
import { Color } from "@/adapters/panels/AttributePanel/components/attributes/Color";
import { ContainerBackgroundColor } from "@/adapters/panels/AttributePanel/components/attributes/ContainerBackgroundColor";
import { FontFamily } from "@/adapters/panels/AttributePanel/components/attributes/FontFamily";
import { FontSize } from "@/adapters/panels/AttributePanel/components/attributes/FontSize";
import { FontStyle } from "@/adapters/panels/AttributePanel/components/attributes/FontStyle";
import { FontWeight } from "@/adapters/panels/AttributePanel/components/attributes/FontWeight";
import { LetterSpacing } from "@/adapters/panels/AttributePanel/components/attributes/LetterSpacing";
import { LineHeight } from "@/adapters/panels/AttributePanel/components/attributes/LineHeight";
import { Link } from "@/adapters/panels/AttributePanel/components/attributes/Link";
import { MergeTags } from "@/adapters/panels/AttributePanel/components/attributes/MergeTags";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { TextDecoration } from "@/adapters/panels/AttributePanel/components/attributes/TextDecoration";
import { TextField } from "@/adapters/panels/common/Form";
import { Width } from "@/adapters/panels/AttributePanel/components/attributes/Width";
import { useEditorProps, useFocusIdx } from "@";
import { useEditorField } from "@/adapters/panels/common/Form/useEditorField";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
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
