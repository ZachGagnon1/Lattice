// @vitest-environment jsdom
import "./setupDom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeAll, describe, expect, it } from "vitest";
import { LatticeEditor } from "@/index";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { blockDefinitions } from "@/domain/blocks";
import { Page } from "@/domain/blocks/definitions/Page";
import { Section } from "@/domain/blocks/definitions/Section";
import { Column } from "@/domain/blocks/definitions/Column";
import { Button } from "@/domain/blocks/definitions/Button";
import { IEmailTemplate } from "@/shared/typings";

function buildData(): IEmailTemplate {
  const column = { ...Column.create(), children: [Button.create()] };
  const section = { ...Section.create(), children: [column] };
  return {
    subject: "Welcome",
    subTitle: "",
    content: { ...Page.create(), children: [section] },
  } as IEmailTemplate;
}

let container: HTMLDivElement;

beforeAll(async () => {
  // The Layers skip link shows only in the wide layout, so every media query matches here.
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  // The circular import leaves the block map empty, so the test registers every block.
  BlockManager.registerBlocks(blockDefinitions);
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<LatticeEditor data={buildData()} height="800px" />);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});

async function click(element: HTMLElement) {
  await act(async () => {
    element.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}

function getLink(href: string) {
  return container.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)!;
}

describe("Skip links", () => {
  it("move the focus from the canvas link to the active block", async () => {
    await click(getLink("#lattice-canvas-region"));
    const frameDocument = container.querySelector("iframe")!.contentDocument!;
    expect(
      frameDocument.activeElement?.hasAttribute("data-block-selection-surface"),
    ).toBe(true);
  });

  it("open the Layer tab from the Layers link and focus the active tree item", async () => {
    const link = getLink("#lattice-blocks-region");
    expect(link.textContent).toContain("Layers");
    await click(link);
    expect(document.activeElement?.getAttribute("role")).toBe("treeitem");
  });

  it("focus the canvas region when the canvas shows a preview", async () => {
    await click(
      container.querySelector<HTMLElement>('[aria-label="View PC Layout"]')!,
    );
    await click(getLink("#lattice-canvas-region"));
    expect(document.activeElement?.id).toBe("lattice-canvas-region");
  });
});
