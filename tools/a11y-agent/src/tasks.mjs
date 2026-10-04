import { countBlocks } from "./browser.mjs";

/** Code checks each goal, so the score never depends on what the model claims. */
export const TASKS = [
  {
    id: "add-button",
    goal: "Add a Button block to the email.",
    async start(page) {
      return { buttons: await countBlocks(page, "button") };
    },
    async reached(page, start) {
      return (await countBlocks(page, "button")) > start.buttons;
    },
  },
  {
    id: "text-settings",
    goal: "Select a text block in the email, then move to the settings of that text block.",
    async start() {
      return {};
    },
    async reached(page) {
      return page.evaluate(() => {
        const settings = document.activeElement?.closest(
          "[data-block-settings]",
        );
        return Boolean(
          settings?.getAttribute("aria-label")?.startsWith("Text"),
        );
      });
    },
  },
  {
    id: "color-picker",
    goal: "Open the settings of any block, then open a color picker in those settings.",
    async start() {
      return {};
    },
    async reached(page) {
      return page.evaluate(() =>
        [...document.querySelectorAll('[role="dialog"]')].some((dialog) =>
          dialog.getAttribute("aria-label")?.toLowerCase().includes("picker"),
        ),
      );
    },
  },
];
