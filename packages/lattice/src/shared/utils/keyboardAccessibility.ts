export interface EditableTarget {
  tagName?: string;
  isContentEditable?: boolean;
  getAttribute?: (name: string) => string | null;
  closest?: (selector: string) => unknown;
}

export function isEditableTarget(
  target: EditableTarget | null | undefined,
): boolean {
  if (!target) return false;

  const tagName = target.tagName?.toLowerCase();
  if (tagName && ["input", "textarea", "select"].includes(tagName)) {
    return true;
  }

  return (
    target.isContentEditable === true ||
    target.getAttribute?.("contenteditable") === "true" ||
    Boolean(target.closest?.(".cm-editor"))
  );
}
