import { describe, expect, it } from "vitest";
import { isEditableTarget } from "./keyboardAccessibility";

describe("isEditableTarget", () => {
  it.each(["INPUT", "textarea", "Select"])(
    "keeps native undo for %s fields",
    (tagName) => {
      expect(isEditableTarget({ tagName })).toBe(true);
    },
  );

  it("keeps native undo for contenteditable and CodeMirror", () => {
    expect(isEditableTarget({ isContentEditable: true })).toBe(true);
    expect(isEditableTarget({ closest: () => ({}) })).toBe(true);
  });

  it("lets the editor handle shortcuts outside fields", () => {
    expect(isEditableTarget({ tagName: "button", closest: () => null })).toBe(
      false,
    );
  });
});
