/** Marks the wrapper of the settings fields for the selected block. */
export const BLOCK_SETTINGS_ATTRIBUTE = "data-block-settings";
export const OPEN_BLOCK_SETTINGS_EVENT = "lattice:open-block-settings";
export const CLOSE_BLOCK_SETTINGS_EVENT = "lattice:close-block-settings";

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[role="combobox"]',
  '[role="slider"]',
  '[contenteditable="true"]',
].join(", ");
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const FOCUS_ATTEMPTS = 10;

type ShortcutKeys = Pick<
  KeyboardEvent,
  "key" | "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;

export function isBlockSettingsShortcut(event: ShortcutKeys) {
  return (
    event.key === "Enter" &&
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export function getBlockSettingsShortcutLabel(userAgent: string) {
  return userAgent.includes("Mac") ? "⌥Enter" : "Alt+Enter";
}

export function requestBlockSettings(target: Document = document) {
  target.dispatchEvent(new CustomEvent(OPEN_BLOCK_SETTINGS_EVENT));
}

export function requestCanvasReturn(target: Document = document) {
  target.dispatchEvent(new CustomEvent(CLOSE_BLOCK_SETTINGS_EVENT));
}

/** Returns false when no settings field can take the focus, for example while its region is hidden. */
export function focusBlockSettings(root: Document) {
  const settings = root.querySelector<HTMLElement>(
    `[${BLOCK_SETTINGS_ATTRIBUTE}]`,
  );
  if (!settings) return false;
  const target =
    settings.querySelector<HTMLElement>(FIELD_SELECTOR) ??
    settings.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  if (!target) return false;
  target.focus();
  return root.activeElement === target;
}

/** The panel can mount or show a frame after the request, so this tries again on each frame. */
export function focusBlockSettingsWhenReady(
  root: Document,
  attempts = FOCUS_ATTEMPTS,
) {
  requestAnimationFrame(() => {
    if (!focusBlockSettings(root) && attempts > 1) {
      focusBlockSettingsWhenReady(root, attempts - 1);
    }
  });
}

/** Escape returns to the canvas, unless a field inside the settings uses the key itself. */
export function isCanvasReturnKey(
  event: ShortcutKeys & { defaultPrevented: boolean },
) {
  if (event.defaultPrevented) return false;
  return isBlockSettingsShortcut(event) || event.key === "Escape";
}
