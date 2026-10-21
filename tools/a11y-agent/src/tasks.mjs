import {
  blockComesFirst,
  countBlocks,
  countAllBlocks,
  isMenuOpen,
} from "./browser.mjs";

const inSettings = (page, labelStart = "") =>
  page.evaluate((start) => {
    const settings = document.activeElement?.closest("[data-block-settings]");
    return Boolean(settings?.getAttribute("aria-label")?.startsWith(start));
  }, labelStart);

/** Code checks each goal, so the score never depends on what the model claims. */
export const TASKS = [
  {
    id: "reach-canvas",
    goal: "Move the focus into the region named Email canvas, which shows the email that you edit.",
    start: async () => ({}),
    reached: (page) =>
      page.evaluate(() => {
        const active = document.activeElement;
        return (
          active?.tagName === "IFRAME" ||
          Boolean(active?.closest("#lattice-canvas-region"))
        );
      }),
  },
  {
    id: "open-add-menu",
    goal: "Open the menu that adds a new block to the email.",
    start: async () => ({}),
    reached: (page) => isMenuOpen(page),
  },
  {
    id: "add-button",
    goal: "Add a Button block to the email.",
    start: async (page) => ({ buttons: await countBlocks(page, "button") }),
    reached: async (page, start) =>
      (await countBlocks(page, "button")) > start.buttons,
  },
  {
    id: "open-settings",
    goal: "Select a content block in the email, such as an Image, a Text, or a Button block, then move to the settings of that block.",
    start: async () => ({}),
    // The Page block is selected at the start, and its settings are the last Tab stops, so they do not count.
    reached: async (page) =>
      (await inSettings(page)) && !(await inSettings(page, "Page")),
  },
  {
    id: "text-settings",
    goal: "Select a text block in the email, then move to the settings of that text block.",
    start: async () => ({}),
    reached: (page) => inSettings(page, "Text"),
  },
  {
    id: "color-picker",
    goal: "Open the settings of any block, then open a color picker in those settings.",
    start: async () => ({}),
    reached: (page) =>
      page.evaluate(() =>
        [...document.querySelectorAll('[role="dialog"]')].some((dialog) =>
          dialog.getAttribute("aria-label")?.toLowerCase().includes("picker"),
        ),
      ),
  },
  {
    id: "merge-tags",
    goal: "Select the Button block, open its settings, and open the merge tag list of its link field.",
    start: async () => ({}),
    reached: (page) =>
      page.evaluate(() =>
        Boolean(
          document.querySelector('[role="dialog"][aria-label="Merge tags"]'),
        ),
      ),
  },
  {
    id: "delete-image",
    goal: "Delete an Image block from the email.",
    start: async (page) => ({ images: await countBlocks(page, "image") }),
    reached: async (page, start) =>
      (await countBlocks(page, "image")) < start.images,
  },
  {
    id: "move-button",
    goal: "Move the Button block so that it comes before the first Image block.",
    start: async () => ({}),
    reached: (page) => blockComesFirst(page, "button", "image"),
  },
  {
    id: "undo-delete",
    goal: "Delete any block from the email, then undo the delete.",
    start: async (page) => ({
      blocks: await countAllBlocks(page),
      deleted: false,
    }),
    // The start object keeps the state between checks: first a drop in the count, then the old count again.
    reached: async (page, start) => {
      const blocks = await countAllBlocks(page);
      if (blocks < start.blocks) start.deleted = true;
      return start.deleted && blocks === start.blocks;
    },
  },
];
