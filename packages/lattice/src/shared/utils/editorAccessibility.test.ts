import { describe, expect, it } from "vitest";
import {
  getEditorA11yProps,
  MJML_PREVIEW_FAILURE_MESSAGE,
} from "./editorAccessibility";

describe("editor accessibility", () => {
  it("connects an invalid editor to its description and error", () => {
    expect(
      getEditorA11yProps("JSON source", "json-help", "json-error"),
    ).toEqual({
      "aria-label": "JSON source",
      "aria-describedby": "json-help json-error",
      "aria-invalid": true,
    });
  });

  it("gives a user action instead of an MJML compiler detail", () => {
    expect(MJML_PREVIEW_FAILURE_MESSAGE).toBe(
      "The preview cannot update. Undo the last change or restore the affected block.",
    );
    expect(MJML_PREVIEW_FAILURE_MESSAGE).not.toContain("mj-");
  });
});
