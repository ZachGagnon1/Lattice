import { describe, expect, it } from "vitest";
import { getEditorA11yProps, getMjmlErrorReport } from "./editorAccessibility";

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

  it("combines MJML errors into one report", () => {
    expect(
      getMjmlErrorReport([
        { formattedMessage: "Line 2: Invalid section" },
        { formattedMessage: "Line 4: Invalid column" },
      ]),
    ).toBe("Line 2: Invalid section\nLine 4: Invalid column");
  });
});
