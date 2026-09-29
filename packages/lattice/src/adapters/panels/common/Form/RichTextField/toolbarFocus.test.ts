// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  focusBlockNode: null as HTMLElement | null,
  iframeDocument: null as Document | null,
  savedRange: null as Range | null,
}));

vi.mock("@", () => ({
  CONTENT_EDITABLE_CLASS_NAME: "content-editable",
  ContentEditableType: { RichText: "richText", Text: "text" },
  DATA_CONTENT_EDITABLE_IDX: "data-content-editable-idx",
  DATA_CONTENT_EDITABLE_TYPE: "data-content-editable-type",
  FIXED_CONTAINER_ID: "FIXED_CONTAINER_ID",
  MergeTagBadge: { revert: (value: string) => value },
  RICH_TEXT_BAR_ID: "easy-email-rich-text-bar",
  getIframeDocument: () => state.iframeDocument,
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

vi.mock("@/adapters/panels/AttributePanel/hooks/useSelectionRange", () => ({
  useSelectionRange: () => ({
    setSelectionRange: (range: Range) => {
      state.savedRange = range;
    },
  }),
}));

vi.mock("@/adapters/ui/Provider/IframeCacheProvider", () => ({
  IframeCacheProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

import { RichTextField } from ".";

describe("RichTextField toolbar focus", () => {
  let host: HTMLDivElement;
  let root: Root;
  let iframe: HTMLIFrameElement;
  let iframeDocument: Document;
  let editable: HTMLDivElement;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    host = document.createElement("div");
    document.body.append(host);

    iframe = document.createElement("iframe");
    document.body.append(iframe);
    iframeDocument = iframe.contentDocument!;
    state.iframeDocument = iframeDocument;

    editable = createEditable("content.children.0", "First text block");
    createEditable("content.children.1", "Last text block");

    const fixedContainer = iframeDocument.createElement("div");
    fixedContainer.id = "FIXED_CONTAINER_ID";
    iframeDocument.body.append(fixedContainer);

    state.focusBlockNode = editable;
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.replaceChildren();
    state.focusBlockNode = null;
    state.iframeDocument = null;
    state.savedRange = null;
  });

  function createEditable(path: string, text: string) {
    const element = iframeDocument.createElement("div");
    element.setAttribute("contenteditable", "true");
    element.tabIndex = 0;
    element.textContent = text;
    element.setAttribute("data-content-editable-idx", path);
    element.setAttribute("data-content-editable-type", "richText");
    iframeDocument.body.append(element);
    return element;
  }

  async function showToolbar() {
    await act(async () => {
      root.render(React.createElement(RichTextField, null));
    });

    await act(async () => {
      editable.focus();
      editable.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    const toolbar = iframeDocument.getElementById("easy-email-rich-text-bar");
    const firstButton = toolbar?.querySelector("button");
    expect(firstButton?.ownerDocument).toBe(iframeDocument);
    return { toolbar, firstButton };
  }

  function selectText() {
    const selection = iframeDocument.getSelection()!;
    const range = iframeDocument.createRange();
    range.selectNodeContents(editable);
    selection.removeAllRanges();
    selection.addRange(range);
    return selection;
  }

  it("keeps the normal Tab order between text blocks", async () => {
    await showToolbar();
    const tabEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    });

    await act(async () => editable.dispatchEvent(tabEvent));

    expect(tabEvent.defaultPrevented).toBe(false);
    expect(iframeDocument.activeElement).toBe(editable);
  });

  it("moves to the toolbar with Alt+F10", async () => {
    const { firstButton } = await showToolbar();
    selectText();
    const shortcutEvent = new KeyboardEvent("keydown", {
      altKey: true,
      bubbles: true,
      cancelable: true,
      key: "F10",
    });

    await act(async () => editable.dispatchEvent(shortcutEvent));

    expect(shortcutEvent.defaultPrevented).toBe(true);
    expect(iframeDocument.activeElement).toBe(firstButton);
    expect(state.savedRange?.toString()).toBe("First text block");
  });

  it("keeps the toolbar visible when a toolbar popover receives focus", async () => {
    const { toolbar } = await showToolbar();
    const popoverInput = iframeDocument.createElement("input");
    toolbar?.append(popoverInput);

    await act(async () => {
      popoverInput.focus();
      popoverInput.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    expect(
      iframeDocument.getElementById("easy-email-rich-text-bar"),
    ).not.toBeNull();
  });
});
