// @vitest-environment jsdom
import "./setupDom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import axe from "axe-core";
import { beforeAll, describe, expect, it } from "vitest";
import { LatticeEditor } from "@/index";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { blockDefinitions } from "@/domain/blocks";
import { Page } from "@/domain/blocks/definitions/Page";
import { Section } from "@/domain/blocks/definitions/Section";
import { Column } from "@/domain/blocks/definitions/Column";
import { Text } from "@/domain/blocks/definitions/Text";
import { Button } from "@/domain/blocks/definitions/Button";
import { IEmailTemplate } from "@/shared/typings";

// jsdom has no layout, so a contrast or a size result is not real. The manual checklist covers them.
const AXE_OPTIONS: axe.RunOptions = {
  resultTypes: ["violations"],
  // axe cannot message a jsdom frame, so the canvas frame gets its own scan.
  iframes: false,
  rules: {
    "color-contrast": { enabled: false },
    "target-size": { enabled: false },
  },
};

function buildData(): IEmailTemplate {
  const column = {
    ...Column.create(),
    children: [Text.create(), Button.create()],
  };
  const section = { ...Section.create(), children: [column] };
  return {
    subject: "Welcome",
    subTitle: "",
    content: { ...Page.create(), children: [section] },
  } as IEmailTemplate;
}

function describeViolations(results: axe.AxeResults) {
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );
}

let container: HTMLDivElement;

beforeAll(async () => {
  // The circular import leaves the block map empty, so the test registers every block.
  BlockManager.registerBlocks(blockDefinitions);
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  // Vitest gives each test file its own jsdom, so the test does not unmount.
  const root = createRoot(container);
  await act(async () => {
    root.render(<LatticeEditor data={buildData()} height="800px" />);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});

async function waitForFrames() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
}

function getCanvas() {
  const frame = container.querySelector("iframe")!;
  return {
    frameWindow: frame.contentWindow as unknown as typeof globalThis,
    frameDocument: frame.contentDocument!,
  };
}

describe("LatticeEditor accessibility", () => {
  it("finds a known violation, so a clean scan means something", async () => {
    const fixture = document.createElement("div");
    fixture.innerHTML = "<button></button>";
    document.body.appendChild(fixture);
    const results = await axe.run(fixture, AXE_OPTIONS);
    fixture.remove();
    expect(describeViolations(results).join()).toContain("button-name");
  });

  it("has no serious or critical axe violations in the editor root", async () => {
    const results = await axe.run(container, AXE_OPTIONS);
    expect(describeViolations(results)).toEqual([]);
  });

  it("has no serious or critical axe violations in the canvas frame", async () => {
    const { frameDocument } = getCanvas();
    expect(frameDocument.body.childElementCount).toBeGreaterThan(0);
    // axe rejects a node from another window, so the scan runs on a copy of the frame body.
    const copy = document.createElement("div");
    copy.innerHTML = frameDocument.body.innerHTML;
    document.body.appendChild(copy);
    const results = await axe.run(copy, AXE_OPTIONS);
    copy.remove();
    expect(describeViolations(results)).toEqual([]);
  });
});

// axe cannot check keyboard behavior, so these tests press the keys.
describe("LatticeEditor keyboard paths", () => {
  it("moves the focus from the canvas to the block settings with Alt+Enter", async () => {
    const { frameWindow, frameDocument } = getCanvas();
    frameDocument.body.dispatchEvent(
      new frameWindow.KeyboardEvent("keydown", {
        key: "Enter",
        altKey: true,
        bubbles: true,
      }),
    );
    await waitForFrames();
    expect(
      document.activeElement?.closest("[data-block-settings]"),
    ).not.toBeNull();
  });

  it("moves the focus back to the block with Escape", async () => {
    const field = document.activeElement as HTMLElement;
    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await waitForFrames();
    const { frameDocument } = getCanvas();
    expect(
      frameDocument.activeElement?.hasAttribute("data-block-selection-surface"),
    ).toBe(true);
  });
});

describe("Add block menu", () => {
  it("opens from the Add Block button of the block toolbar", async () => {
    const { frameDocument } = getCanvas();
    const surface = frameDocument.querySelector<HTMLElement>(
      "[data-block-selection-surface]",
    );
    expect(surface).not.toBeNull();
    await act(async () => {
      surface!.focus();
    });
    await waitForFrames();
    const addButton = frameDocument.querySelector<HTMLElement>(
      '#easy-email-extensions-InteractivePrompt-Toolbar [aria-label="Add Block"]',
    );
    await act(async () => {
      addButton!.click();
    });
    await waitForFrames();
    const menus = [
      ...frameDocument.querySelectorAll('[role="menu"]'),
      ...document.querySelectorAll('[role="menu"]'),
    ];
    expect(menus.length).toBeGreaterThan(0);
    // jsdom does not render the text toolbar, so this checks the marker that keeps it open.
    expect(menus[0].closest("[data-rich-text-toolbar-popup]")).not.toBeNull();

    // An open menu holds the focus, so the next test could not select a block.
    await act(async () => {
      menus[0].dispatchEvent(
        new (getCanvas().frameWindow.KeyboardEvent)("keydown", {
          key: "Escape",
          bubbles: true,
        }),
      );
    });
    await waitForFrames();
    expect(frameDocument.querySelector('[role="menu"]')).toBeNull();
  });
});

describe("Color picker", () => {
  it("moves the focus into the picker, and Escape returns it to the swatch", async () => {
    const { frameWindow, frameDocument } = getCanvas();
    frameDocument.body.dispatchEvent(
      new frameWindow.KeyboardEvent("keydown", {
        key: "Enter",
        altKey: true,
        bubbles: true,
      }),
    );
    await waitForFrames();
    const swatch = document.querySelector<HTMLElement>(
      '[data-block-settings] [aria-haspopup="dialog"]',
    );
    expect(swatch).not.toBeNull();
    await act(async () => {
      swatch!.focus();
      swatch!.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();

    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(document.activeElement).toBe(swatch);
  });
});

describe("Merge tag button", () => {
  it("has one named Tab stop, and moves the focus into its dialog and back", async () => {
    const { frameWindow, frameDocument } = getCanvas();
    const buttonBlock = frameDocument.querySelector<HTMLElement>(
      '[data-block-selection-surface][aria-label*="Button"]',
    );
    expect(buttonBlock).not.toBeNull();
    await act(async () => {
      buttonBlock!.focus();
    });
    await waitForFrames();
    frameDocument.body.dispatchEvent(
      new frameWindow.KeyboardEvent("keydown", {
        key: "Enter",
        altKey: true,
        bubbles: true,
      }),
    );
    await waitForFrames();

    const settings = document.querySelector("[data-block-settings]")!;
    expect(settings.querySelectorAll("legend button")).toHaveLength(0);
    const trigger = settings.querySelector<HTMLElement>(
      '[aria-label="Insert merge tag"]',
    );
    expect(trigger).not.toBeNull();

    await act(async () => {
      trigger!.focus();
      trigger!.click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(
      document.activeElement?.closest(
        '[role="dialog"][aria-label="Merge tags"]',
      ),
    ).not.toBeNull();

    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(document.activeElement).toBe(trigger);
  });
});
