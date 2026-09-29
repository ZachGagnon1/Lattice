// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  focusBlockNode: null as HTMLElement | null,
}));

vi.mock("@", () => ({
  CONTENT_EDITABLE_CLASS_NAME: "content-editable",
  ContentEditableType: { RichText: "richText", Text: "text" },
  DATA_CONTENT_EDITABLE_IDX: "data-content-editable-idx",
  DATA_CONTENT_EDITABLE_TYPE: "data-content-editable-type",
  FIXED_CONTAINER_ID: "FIXED_CONTAINER_ID",
  MergeTagBadge: { revert: (value: string) => value },
  RICH_TEXT_BAR_ID: "easy-email-rich-text-bar",
  getIframeDocument: () => document,
  useEditorContext: () => ({ initialized: true }),
  useEditorProps: () => ({
    enabledMergeTagsBadge: false,
    mergeTagGenerate: (value: string) => value,
  }),
  useFocusBlockLayout: () => ({ focusBlockNode: state.focusBlockNode }),
}));

vi.mock("../InlineTextField", () => ({
  InlineText: () => null,
}));

vi.mock("../useEditorField", () => ({
  useEditorField: () => ({
    input: { onBlur: vi.fn(), onChange: vi.fn() },
  }),
}));

vi.mock("../RichTextToolBar/components/Tools", () => ({
  Tools: () => React.createElement("button", null, "Bold"),
}));

vi.mock("@/adapters/ui/Provider/IframeCacheProvider", () => ({
  IframeCacheProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

import { RichTextField } from ".";

describe("RichTextField toolbar focus", () => {
  let host: HTMLDivElement;
  let root: Root;
  let editable: HTMLDivElement;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement("div");
    document.body.append(host);

    const fixedContainer = document.createElement("div");
    fixedContainer.id = "FIXED_CONTAINER_ID";
    document.body.append(fixedContainer);

    editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    editable.tabIndex = 0;
    editable.setAttribute("data-content-editable-idx", "content.children.0");
    editable.setAttribute("data-content-editable-type", "richText");
    document.body.append(editable);
    state.focusBlockNode = editable;

    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.replaceChildren();
    state.focusBlockNode = null;
  });

  it("keeps the toolbar open when Tab moves focus from rich text", async () => {
    await act(async () => {
      root.render(React.createElement(RichTextField, null));
    });

    await act(async () => {
      editable.focus();
      editable.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    const toolbar = document.getElementById("easy-email-rich-text-bar");
    const firstButton = toolbar?.querySelector("button");
    expect(firstButton).toBeInstanceOf(HTMLButtonElement);

    const tabEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    });
    await act(async () => editable.dispatchEvent(tabEvent));

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(firstButton);
    expect(document.getElementById("easy-email-rich-text-bar")).toBe(toolbar);
  });
});
