export type InputModality = "keyboard" | "pointer";

const NAVIGATION_KEYS = new Set(["Tab", "F6", "F10"]);

/** A navigation key means a keyboard user, and a pointer press means a mouse or touch user. Typing does not count, because mouse users type too. */
export function modalityForEvent(event: {
  type: string;
  key?: string;
  altKey?: boolean;
}): InputModality | null {
  if (event.type === "pointerdown") return "pointer";
  if (event.type !== "keydown") return null;
  if (NAVIGATION_KEYS.has(event.key ?? "")) return "keyboard";
  if (event.altKey && event.key === "Enter") return "keyboard";
  return null;
}
