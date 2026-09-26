import React, { useCallback } from "react";
import { Padding } from "@/adapters/panels/AttributePanel/components/attributes/Padding";
import { Background } from "@/adapters/panels/AttributePanel/components/attributes/Background";
import { Border } from "@/adapters/panels/AttributePanel/components/attributes/Border";
import { AttributesPanelWrapper } from "@/adapters/panels/AttributePanel/components/attributes/AttributesPanelWrapper";
import { BasicType, BlockManager, useBlock, useFocusIdx } from "@";
import { ClassName } from "@/adapters/panels";
import { CollapsableItem } from "@/adapters/panels/common/Collapse/CollapsableItem";
import { TextField } from "@/adapters/panels/common/Form";
import { Stack } from "@mui/material";
import { SwitchInput } from "@/adapters/panels/common/Form/SwitchInput";

export function Section() {
  const { focusBlock, setFocusBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const noWrap = focusBlock?.data.value.noWrap;

  const onChange = useCallback(
    (checked: boolean) => {
      if (!focusBlock) {
        return;
      }
      focusBlock.data.value.noWrap = checked;
      if (checked) {
        const children = [...focusBlock.children];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child) {
            continue;
          }
          if (child.type === BasicType.GROUP) {
            children.splice(i, 1, ...child.children);
          }
        }
        focusBlock.children = [
          BlockManager.getBlockByType(BasicType.GROUP)!.create({
            children: children,
          }),
        ];
      } else {
        if (
          focusBlock.children.length === 1 &&
          focusBlock.children[0].type === BasicType.GROUP
        ) {
          focusBlock.children = focusBlock.children[0]?.children || [];
        }
      }
      setFocusBlock({ ...focusBlock });
    },
    [focusBlock, setFocusBlock],
  );

  return (
    <AttributesPanelWrapper style={{ padding: 0 }}>
      <CollapsableItem title={t("Dimension")}>
        <Stack spacing={2}>
          <SwitchInput
            label={t("Group")}
            checked={noWrap}
            onChange={onChange}
          />
          <TextField
            label={t("Full Width")}
            name={`${focusIdx}.attributes.full-width`}
          />
          <Padding />
        </Stack>
      </CollapsableItem>
      <CollapsableItem title={t("Background")}>
        <Background />
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
