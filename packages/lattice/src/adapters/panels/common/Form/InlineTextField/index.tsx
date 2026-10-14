import React, { useEffect } from "react";
import {
  ContentEditableType,
  getIframeDocument,
  DATA_CONTENT_EDITABLE_TYPE,
} from "@";

export interface InlineTextProps {
  children?: React.ReactNode;
  onChange: (content: string) => void;
}

/** Returns the field value of an editable block, or null when the target is not one. */
export function readEditableContent(target: HTMLElement): string | null {
  if (!target.getAttribute("contenteditable")) return null;

  const contentEditableType = target.getAttribute(DATA_CONTENT_EDITABLE_TYPE);
  if (contentEditableType === ContentEditableType.RichText) {
    return target.innerHTML || "";
  }
  if (contentEditableType === ContentEditableType.Text) {
    return target.textContent?.trim() ?? "";
  }
  return null;
}

export function InlineText({ onChange, children }: InlineTextProps) {
  useEffect(() => {
    const iframeDocument = getIframeDocument();

    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;

      if (target.getAttribute("contenteditable")) {
        e.preventDefault();

        const text = e.clipboardData?.getData("text/plain") ?? "";
        iframeDocument?.execCommand("insertHTML", false, text);
        const content = readEditableContent(target);
        if (content !== null) onChange(content);
      }
    };

    const onInput = (e: Event) => {
      const content = readEditableContent(e.target as HTMLElement);
      if (content !== null) onChange(content);
    };

    iframeDocument?.body.addEventListener("paste", onPaste as any, true);
    iframeDocument?.body.addEventListener("input", onInput);

    return () => {
      iframeDocument?.body.removeEventListener("paste", onPaste as any, true);
      iframeDocument?.body.removeEventListener("input", onInput);
    };
  }, [onChange]);

  return <>{children}</>;
}
