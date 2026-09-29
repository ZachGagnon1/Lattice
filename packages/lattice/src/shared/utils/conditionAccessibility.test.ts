import { describe, expect, it } from "vitest";
import {
  getIssueControlId,
  getRuleLabel,
  getRulePath,
} from "./conditionAccessibility";

describe("condition accessibility", () => {
  it("labels a nested rule with its visible position", () => {
    const name = "rulesTree.rules[0].rules[2]";

    expect(getRulePath(name)).toBe("rules.0.rules.2");
    expect(getRuleLabel(name)).toBe("Rule 1.3");
  });

  it("links each issue type to its invalid control", () => {
    expect(
      getIssueControlId({
        path: "rules.0",
        code: "MISSING_VALUE",
        message: "Type a value.",
      }),
    ).toBe("condition-rules-0-value");
  });
});
