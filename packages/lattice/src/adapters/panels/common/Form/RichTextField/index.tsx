import {
  CONTENT_EDITABLE_CLASS_NAME,
  ContentEditableType,
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_EDITABLE_TYPE,
  FIXED_CONTAINER_ID,
  getIframeDocument,
  MergeTagBadge,
  RICH_TEXT_BAR_ID,
  useEditorProps,
  useFocusBlockLayout,
} from "@";
import React, { useCallback, useEffect, useState } from "react";
import { InlineText, InlineTextProps } from "../InlineTextField";
import { RichTextToolBar } from "../RichTextToolBar";
import { useEditorField } from "../useEditorField";
import { debounce } from "lodash-es";
import { getEditableField } from "@/shared/utils/editableTarget";

export const RichTextField = (
  props: Omit<InlineTextProps, "onChange" | "mutators">,
) => {
  const [contentEditableName, setContentEditableName] = useState("");
  const [contentEditableType, setContentEditableType] = useState<string | null>(
    CONTENT_EDITABLE_CLASS_NAME,
  );

  const { focusBlockNode } = useFocusBlockLayout(); // 2. Consume the hook

  // Listener for clicks OUTSIDE the iframe (on the parent window)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (getIframeDocument()?.contains(e.target as Node)) {
        return;
      }
      const fixedContainer = document.getElementById(FIXED_CONTAINER_ID);
      if (fixedContainer?.contains(e.target as Node)) {
        return;
      }
      setContentEditableName("");
    };

    // Attach to the parent document, not the iframe
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Listener for clicks INSIDE the iframe
  useEffect(() => {
    const root = getIframeDocument();
    if (!root) return;
    const updateField = (e: Event) => {
      const target = e.target as HTMLElement;

      const fixedContainer = root.getElementById(FIXED_CONTAINER_ID);
      const richTextBar = root.getElementById(RICH_TEXT_BAR_ID);
      const toolbarPopup = target.closest("[data-rich-text-toolbar-popup]");
      if (
        fixedContainer?.contains(target) ||
        richTextBar?.contains(target) ||
        toolbarPopup
      ) {
        return;
      }
      const editable = getEditableField(
        target,
        DATA_CONTENT_EDITABLE_IDX,
        DATA_CONTENT_EDITABLE_TYPE,
      );
      if (!editable) {
        setContentEditableName("");
      } else {
        setContentEditableType(editable.type);
        setContentEditableName(editable.name);
      }
    };

    root.addEventListener("click", updateField);
    root.addEventListener("focusin", updateField);
    return () => {
      root.removeEventListener("click", updateField);
      root.removeEventListener("focusin", updateField);
    };
  }, [focusBlockNode]);

  // Clean up toolbar visibility if the focus block changes
  // (e.g., when the block is deleted or a parent is selected via toolbar buttons)
  useEffect(() => {
    const activeElement = getIframeDocument()?.activeElement;
    const idxName = activeElement?.getAttribute(DATA_CONTENT_EDITABLE_IDX);

    // If the active element is no longer a valid rich text node, hide the toolbar
    if (!idxName) {
      setContentEditableName("");
    }
  }, [focusBlockNode]);

  if (!contentEditableName) return null;

  return (
    <FieldWrapper
      key={contentEditableName}
      {...props}
      name={contentEditableName}
      contentEditableType={contentEditableType}
    />
  );
};

function FieldWrapper(
  props: Omit<InlineTextProps, "onChange"> & {
    name: string;
    contentEditableType: string | null;
  },
) {
  const { name, contentEditableType, ...rest } = props;
  const { input } = useEditorField<string>(name);
  const { mergeTagGenerate, enabledMergeTagsBadge } = useEditorProps();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceCallbackChange = useCallback(
    debounce((val) => {
      if (enabledMergeTagsBadge) {
        input.onChange(MergeTagBadge.revert(val, mergeTagGenerate));
      } else {
        input.onChange(val);
      }

      input.onBlur();
    }, 200),
    [input],
  );

  return (
    <>
      {contentEditableType === ContentEditableType.RichText && (
        <RichTextToolBar onChange={debounceCallbackChange} />
      )}
      <InlineText {...rest} onChange={debounceCallbackChange} />
    </>
  );
}
