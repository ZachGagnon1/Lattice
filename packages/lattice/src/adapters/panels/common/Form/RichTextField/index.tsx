import {
  CONTENT_EDITABLE_CLASS_NAME,
  ContentEditableType,
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_EDITABLE_TYPE,
  FIXED_CONTAINER_ID,
  getIframeDocument,
  RICH_TEXT_BAR_ID,
  useFocusBlockLayout,
} from "@";
import React, { useEffect, useState } from "react";
import { InlineTextProps, readEditableContent } from "../InlineTextField";
import { RichTextToolBar } from "../RichTextToolBar";
import { getEditableField } from "@/shared/utils/editableTarget";
import { isEditingText } from "@/shared/utils/contenteditable";
import { useTextCommit } from "./useTextCommit";

export const RichTextField = (
  props: Omit<InlineTextProps, "onChange" | "mutators">,
) => {
  const [contentEditableName, setContentEditableName] = useState("");
  const [contentEditableType, setContentEditableType] = useState<string | null>(
    CONTENT_EDITABLE_CLASS_NAME,
  );

  const { focusBlockNode } = useFocusBlockLayout(); // 2. Consume the hook
  const commitText = useTextCommit();

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
        // A drag selection that ends outside the text sends the click to a parent, but the text keeps the focus.
        if (e.type === "click" && isEditingText(root)) return;
        setContentEditableName("");
      } else {
        setContentEditableType(editable.type);
        setContentEditableName(editable.name);
      }
    };

    // These listeners stay while the toolbar is hidden, so a text edit always reaches the form.
    const commitEditable = (target: HTMLElement) => {
      const editable = getEditableField(
        target,
        DATA_CONTENT_EDITABLE_IDX,
        DATA_CONTENT_EDITABLE_TYPE,
      );
      const content = readEditableContent(target);
      if (editable && content !== null) {
        commitText(editable.name, content);
      }
    };

    const onInput = (e: Event) => commitEditable(e.target as HTMLElement);

    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.getAttribute("contenteditable")) return;

      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      root.execCommand("insertHTML", false, text);
      commitEditable(target);
    };

    root.addEventListener("click", updateField);
    root.addEventListener("focusin", updateField);
    root.body.addEventListener("input", onInput);
    root.body.addEventListener("paste", onPaste, true);
    return () => {
      root.removeEventListener("click", updateField);
      root.removeEventListener("focusin", updateField);
      root.body.removeEventListener("input", onInput);
      root.body.removeEventListener("paste", onPaste, true);
    };
  }, [focusBlockNode, commitText]);

  // Hide the toolbar when the focus block changes, for example after a delete.
  // A re-render also changes the block, so keep the toolbar while the user still edits text.
  useEffect(() => {
    if (!isEditingText(getIframeDocument())) {
      setContentEditableName("");
    }
  }, [focusBlockNode]);

  if (!contentEditableName) return null;

  return (
    <>
      {contentEditableType === ContentEditableType.RichText && (
        <RichTextToolBar
          key={contentEditableName}
          onChange={(value) => commitText(contentEditableName, value)}
        />
      )}
      {props.children}
    </>
  );
};
