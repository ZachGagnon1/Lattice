import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMAIL_BLOCK_CLASS_NAME, getIframeDocument } from "@";
import { SearchField, SwitchField } from "@/adapters/panels/common/Form";
import { ToolItem } from "../ToolItem";
import { Box, Popover, Stack } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

export interface LinkParams {
  link: string;
  blank: boolean;
  underline: boolean;
  linkNode: HTMLAnchorElement | null;
}

export interface LinkProps {
  currentRange: Range | null | undefined;
  onChange: (val: LinkParams) => void;
}

function getAnchorElement(node: Node | null): HTMLAnchorElement | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "a") {
    return node as HTMLAnchorElement;
  }
  return getAnchorElement(node.parentNode);
}

export function getLinkNode(
  currentRange: Range | null | undefined,
): HTMLAnchorElement | null {
  if (!currentRange) {
    return null;
  }
  return getAnchorElement(currentRange.startContainer);
}

export function Link(props: Readonly<LinkProps>) {
  const { currentRange, onChange } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [activeNode, setActiveNode] = useState<HTMLAnchorElement | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // Clone the exact highlight range so the browser doesn't destroy it when focus shifts
    if (currentRange) {
      setSavedRange(currentRange.cloneRange());
    } else {
      setSavedRange(null);
    }

    setActiveNode(getLinkNode(currentRange));
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "link-popover" : undefined;

  const linkNode = open ? activeNode : getLinkNode(currentRange);

  const initialValues = useMemo(() => {
    let link = "";
    let blank = true;
    let underline = true;
    if (linkNode) {
      link = linkNode.getAttribute("href") ?? "";
      blank = linkNode.getAttribute("target") === "_blank";
      underline = linkNode.style.textDecoration === "underline";
    }
    return { link, blank, underline };
  }, [linkNode]);

  const onSubmit = useCallback(
    (values: Omit<LinkParams, "linkNode">) => {
      if (savedRange) {
        const iframeWindow = getIframeDocument()?.defaultView;

        if (iframeWindow) {
          iframeWindow.focus();

          const selection = iframeWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          }
        }
      }

      onChange({ ...values, linkNode: activeNode });
      handleClose();
    },
    [activeNode, onChange, savedRange],
  );

  const methods = useForm<Omit<LinkParams, "linkNode">>({
    defaultValues: initialValues,
  });
  const { reset, setValue, handleSubmit } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <FormProvider {...methods}>
      <span
        style={{
          height: "27px",
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ToolItem
          onClick={handleClick}
          isActive={Boolean(initialValues.link) || open}
          title="Link"
          icon={<LinkIcon />}
        />
      </span>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        container={anchorEl?.ownerDocument.body}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box
          sx={{ p: 2, width: 320 }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Stack spacing={2}>
            <SearchField
              size="small"
              name="link"
              label="Link"
              labelHidden
              searchButton="Apply"
              placeholder="https://www.example.com"
              onSearch={(val) => {
                // Skip the 300ms field debounce, so the submit reads the value just typed.
                setValue("link", val);
                void handleSubmit(onSubmit)();
              }}
            />

            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <SwitchField size="small" label="Target Blank" name="blank" />
              <SwitchField size="small" label="Underline" name="underline" />
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </FormProvider>
  );
}
