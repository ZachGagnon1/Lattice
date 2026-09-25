import { describe, expect, it } from "vitest";
import { replaceEqualDeep, toFieldPath } from "./formValues";

describe("toFieldPath", () => {
  it("converts bracket paths", () => {
    expect(toFieldPath("content.children.[0].attributes")).toBe(
      "content.children.0.attributes",
    );
    expect(toFieldPath("content.attributes[padding]")).toBe(
      "content.attributes.padding",
    );
    expect(toFieldPath("fonts[1].name")).toBe("fonts.1.name");
    expect(toFieldPath("content")).toBe("content");
  });
});

describe("replaceEqualDeep", () => {
  it("returns prev when next is a deep copy", () => {
    const prev = { a: [{ b: 1 }], c: { d: "x" } };
    expect(replaceEqualDeep(prev, structuredClone(prev))).toBe(prev);
  });

  it("keeps unchanged siblings", () => {
    const prev = { list: [{ id: 1 }, { id: 2 }] };
    const next = { list: [{ id: 1 }, { id: 3 }] };
    const out = replaceEqualDeep(prev, next);
    expect(out).not.toBe(prev);
    expect(out.list[0]).toBe(prev.list[0]);
    expect(out.list[1]).toBe(next.list[1]);
    expect(out).toEqual(next);
  });

  it("returns next for a changed primitive", () => {
    expect(replaceEqualDeep(1, 2)).toBe(2);
  });

  it("handles an added key and a removed array item", () => {
    const out1 = replaceEqualDeep({ a: 1 }, { a: 1, b: 2 });
    expect(out1).toEqual({ a: 1, b: 2 });
    expect(out1).not.toBe({ a: 1 });
    expect(replaceEqualDeep([1, 2], [1])).toEqual([1]);
  });
});
