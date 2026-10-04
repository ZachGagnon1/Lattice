import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve("axe-core/axe.min.js");

export async function launch({ url, headed }) {
  const executablePath = process.env.A11Y_AGENT_BROWSER_PATH;
  // Without a path, Playwright uses the installed Chrome, so nothing downloads.
  const browser = await chromium.launch({
    headless: !headed,
    ...(executablePath ? { executablePath } : { channel: "chrome" }),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await openEditor(page, url);
  return { browser, page };
}

export async function openEditor(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // The canvas fills its iframe only after the editor mounts.
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("iframe")].some((frame) =>
        frame.contentDocument?.querySelector(".email-block"),
      ),
    null,
    { timeout: 30_000 },
  );
}

async function canvasFrame(page) {
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const isCanvas = await frame
      .evaluate(() => Boolean(document.querySelector(".email-block")))
      .catch(() => false);
    if (isCanvas) return frame;
  }
  return null;
}

/** The frame that holds the focus. The main frame reports the iframe itself when the focus is inside it. */
async function focusedFrame(page) {
  for (const frame of page.frames()) {
    const holdsFocus = await frame
      .evaluate(() => {
        const element = document.activeElement;
        return Boolean(
          element && element !== document.body && element.tagName !== "IFRAME",
        );
      })
      .catch(() => false);
    if (holdsFocus) return frame;
  }
  return null;
}

/** What a screen reader reports about the focus: the accessible role and name, the context, and the hints. */
export async function observeFocus(page) {
  const frame = await focusedFrame(page);
  if (!frame)
    return {
      key: "body",
      spoken: "the page body (no control has the focus)",
      named: true,
      visible: true,
    };

  const spoken = await frame
    .locator("*:focus")
    .first()
    .ariaSnapshot({ timeout: 2_000 })
    .then((snapshot) =>
      snapshot.split("\n")[0].replace(/^- /, "").replace(/:$/, ""),
    )
    .catch(() => "an element with no role");

  const details = await frame.evaluate(() => {
    const element = document.activeElement;
    const style = getComputedStyle(element);
    const outline =
      style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
    const shadow = Boolean(style.boxShadow) && style.boxShadow !== "none";
    // An MUI field draws its focus on the wrapper, which carries Mui-focused.
    const muiFocus = Boolean(
      element.closest(".Mui-focused, .Mui-focusVisible"),
    );
    // A canvas block takes the focus on a hidden button, and the canvas outlines the whole block instead.
    const blockSurface = element.hasAttribute("data-block-selection-surface");

    const context = [];
    const contextRoles = [
      "dialog",
      "menu",
      "toolbar",
      "group",
      "region",
      "listbox",
      "tree",
      "tablist",
      "navigation",
    ];
    for (
      let node = element.parentElement;
      node && context.length < 3;
      node = node.parentElement
    ) {
      const role =
        node.getAttribute("role") ??
        (node.tagName === "ASIDE" ? "complementary" : null);
      const label = node.getAttribute("aria-label");
      if (
        role &&
        (contextRoles.includes(role) || role === "complementary") &&
        label
      ) {
        context.push(`${role} "${label}"`);
      }
    }

    const describedBy = (element.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(" ");

    return {
      // The tag and the path make a stable key, so a repeated focus stop shows as the same stop.
      path: (() => {
        const parts = [];
        for (
          let node = element;
          node && node !== document.body;
          node = node.parentElement
        ) {
          const index = node.parentElement
            ? [...node.parentElement.children].indexOf(node)
            : 0;
          parts.unshift(`${node.tagName}${index}`);
        }
        return parts.join(">");
      })(),
      visible: outline || shadow || muiFocus || blockSurface,
      context,
      description: element.getAttribute("aria-description") ?? describedBy,
      shortcut: element.getAttribute("aria-keyshortcuts") ?? "",
    };
  });

  const named = /"[^"]+"/.test(spoken) || /^(text|paragraph)/.test(spoken);
  const box = await frame
    .locator("*:focus")
    .first()
    .boundingBox({ timeout: 1_000 })
    .catch(() => null);
  return {
    key: `${frame.url()}|${details.path}`,
    spoken,
    named,
    box,
    ...details,
  };
}

const LANDMARK_SELECTOR =
  'main, nav, aside, [role="main"], [role="navigation"], [role="complementary"], [role="region"][aria-label]';

/** A screen reader moves between landmarks with one key, for example D in NVDA. */
export async function moveToLandmark(page, backwards) {
  return page.mainFrame().evaluate(
    ({ selector, backwards }) => {
      const landmarks = [...document.querySelectorAll(selector)].filter(
        (node) => node.getClientRects().length > 0,
      );
      if (!landmarks.length) return false;
      const active = document.activeElement;
      const index = landmarks.findIndex(
        (node) => node === active || node.contains(active),
      );
      const step = backwards ? -1 : 1;
      const nextIndex =
        index < 0
          ? backwards
            ? landmarks.length - 1
            : 0
          : (index + step + landmarks.length) % landmarks.length;
      const next = landmarks[nextIndex];
      if (!next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1");
      next.focus();
      return true;
    },
    { selector: LANDMARK_SELECTOR, backwards },
  );
}

export async function readAnnouncements(page) {
  const texts = [];
  for (const frame of page.frames()) {
    const found = await frame
      .evaluate(() =>
        [
          ...document.querySelectorAll(
            '[role="status"], [role="alert"], [aria-live]',
          ),
        ]
          .map((node) => node.textContent?.trim())
          .filter(Boolean),
      )
      .catch(() => []);
    texts.push(...found);
  }
  return texts;
}

export async function countBlocks(page, type) {
  const frame = await canvasFrame(page);
  if (!frame) return 0;
  return frame.evaluate(
    (name) =>
      document.querySelectorAll(`.email-block.node-type-${name}`).length,
    type,
  );
}

async function runAxeIn(frame) {
  await frame.addScriptTag({ path: AXE_PATH });
  return frame.evaluate(async () => {
    const results = await window.axe.run(document, {
      resultTypes: ["violations"],
      iframes: false,
    });
    return results.violations
      .filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      )
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        count: violation.nodes.length,
        help: violation.help,
      }));
  });
}

/** Real Chromium has layout, so this scan also checks the color contrast that jsdom cannot. */
export async function runAxe(page) {
  const editor = await runAxeIn(page.mainFrame());
  const frame = await canvasFrame(page);
  const canvas = frame ? await runAxeIn(frame) : [];
  return { editor, canvas };
}
