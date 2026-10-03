import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Box, Stack } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { SearchField, SwitchField } from "@/adapters/panels/common/Form";
import { ToolItem } from "../ToolItem";
import { ToolbarPopover, useToolbarPopup } from "../ToolbarPopover";
import { useToolbar } from "../../ToolbarContext";

export interface LinkParams {
  link: string;
  blank: boolean;
  underline: boolean;
  linkNode: HTMLAnchorElement | null;
}

type LinkFormValues = Omit<LinkParams, "linkNode">;

export function getLinkNode(range: Range | null | undefined) {
  let node: Node | null = range?.startContainer ?? null;
  while (node) {
    const element = node as Element;
    if (element.classList?.contains(EMAIL_BLOCK_CLASS_NAME)) return null;
    if (element.tagName?.toLowerCase() === "a") {
      return element as HTMLAnchorElement;
    }
    node = node.parentNode;
  }
  return null;
}

function getFormValues(linkNode: HTMLAnchorElement | null): LinkFormValues {
  return {
    link: linkNode?.getAttribute("href") ?? "",
    blank: linkNode ? linkNode.getAttribute("target") === "_blank" : true,
    underline: linkNode ? linkNode.style.textDecoration === "underline" : true,
  };
}

export function Link() {
  const { execCommand, savedRange } = useToolbar();
  const popup = useToolbarPopup();
  // The popover input takes the selection, so read the link node before it opens.
  const [openLinkNode, setOpenLinkNode] = useState<HTMLAnchorElement | null>(
    null,
  );
  const currentLinkNode = getLinkNode(savedRange);
  const linkNode = popup.isOpen ? openLinkNode : currentLinkNode;
  const defaultValues = useMemo(() => getFormValues(linkNode), [linkNode]);

  const methods = useForm<LinkFormValues>({ defaultValues });
  const { reset, setValue, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (values: LinkFormValues) => {
    popup.close();
    execCommand("createLink", { ...values, linkNode: openLinkNode });
  };

  return (
    <FormProvider {...methods}>
      <ToolItem
        {...popup.triggerProps}
        onClick={(event) => {
          setOpenLinkNode(currentLinkNode);
          popup.open(event);
        }}
        title={t("Link")}
        icon={<LinkIcon />}
        isActive={Boolean(currentLinkNode) || popup.isOpen}
        aria-haspopup="dialog"
      />
      <ToolbarPopover popup={popup} label={t("Link")} initialFocus="input">
        <Box sx={{ p: 2, width: 320 }}>
          <Stack spacing={2}>
            <SearchField
              size="small"
              name="link"
              label={t("Link")}
              labelHidden
              searchButton={t("Apply")}
              placeholder="https://www.example.com"
              onSearch={(value) => {
                // Skip the 300ms field debounce, so the submit reads the value just typed.
                setValue("link", value);
                void handleSubmit(onSubmit)();
              }}
            />
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <SwitchField
                size="small"
                label={t("Open in a new tab")}
                name="blank"
              />
              <SwitchField
                size="small"
                label={t("Underline")}
                name="underline"
              />
            </Stack>
          </Stack>
        </Box>
      </ToolbarPopover>
    </FormProvider>
  );
}

export function Unlink() {
  const { execCommand, savedRange } = useToolbar();
  const linkNode = getLinkNode(savedRange);

  return (
    <ToolItem
      title={t("Remove link")}
      icon={<LinkOffIcon />}
      // Stay focusable, so the arrow keys and a screen reader still find the button.
      aria-disabled={!linkNode}
      onClick={() => {
        if (!linkNode) return;
        linkNode.replaceWith(...linkNode.childNodes);
        execCommand("");
      }}
    />
  );
}
