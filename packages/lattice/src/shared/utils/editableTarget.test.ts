import { describe, expect, it } from "vitest";
import { getEditableField } from "./editableTarget";

describe("getEditableField", () => {
  it("finds the editable field from a nested click target", () => {
    const field = {
      getAttribute: (name: string) =>
        name === "data-index" ? "content.children.0" : "richText",
    };
    const target = { closest: () => field };

    expect(getEditableField(target, "data-index", "data-type")).toMatchObject({
      name: "content.children.0",
      type: "richText",
    });
  });

  it("returns null outside an editable field", () => {
    expect(
      getEditableField({ closest: () => null }, "data-index", "data-type"),
    ).toBeNull();
  });
});
