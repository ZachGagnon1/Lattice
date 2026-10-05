// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { BasicType } from "@/domain/constants";
import { parseJsonSource } from "./parseJsonSource";

const section = {
  type: BasicType.SECTION,
  data: { value: {} },
  attributes: {},
  children: [],
};
const page = {
  type: BasicType.PAGE,
  data: { value: {} },
  attributes: {},
  children: [],
};
const template = JSON.stringify({ subject: "s", subTitle: "t", content: page });

describe("parseJsonSource", () => {
  it("returns a valid section block", () => {
    expect(
      parseJsonSource(JSON.stringify(section), "content.children.[0]"),
    ).toEqual(section);
  });

  it("returns the page of a full template when the page has the focus", () => {
    const result = parseJsonSource(template, "content");
    expect(result.type).toBe(BasicType.PAGE);
  });

  it("rejects a full template when another block has the focus", () => {
    expect(() => parseJsonSource(template, "content.children.[0]")).toThrow(
      "Invalid content",
    );
  });

  it("rejects an object without a type", () => {
    expect(() => parseJsonSource("{ foo: 1 }", "content")).toThrow(
      "Invalid content",
    );
  });

  it("rejects an unknown type", () => {
    expect(() =>
      parseJsonSource(JSON.stringify({ ...section, type: "nope" }), "content"),
    ).toThrow("Invalid content");
  });
});
