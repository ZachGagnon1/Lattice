// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { ensureKitStyles } from ".";

const kitTags = (doc: Document) =>
  doc.head.querySelectorAll("style[data-lattice-kit]");

describe("ensureKitStyles", () => {
  it("adds the kit CSS once", () => {
    const doc = document.implementation.createHTMLDocument("a");
    ensureKitStyles(doc, ".x{}");
    ensureKitStyles(doc, ".x{}");
    expect(kitTags(doc)).toHaveLength(1);
    expect(kitTags(doc)[0].textContent).toBe(".x{}");
  });

  it("puts the tag before the host styles", () => {
    const doc = document.implementation.createHTMLDocument("b");
    doc.head.appendChild(doc.createElement("style"));
    ensureKitStyles(doc, ".x{}");
    expect(doc.head.firstElementChild).toBe(kitTags(doc)[0]);
  });

  it("gives each document its own copy", () => {
    const page = document.implementation.createHTMLDocument("page");
    const frame = document.implementation.createHTMLDocument("frame");
    ensureKitStyles(page, ".x{}");
    ensureKitStyles(frame, ".x{}");
    expect(kitTags(page)).toHaveLength(1);
    expect(kitTags(frame)).toHaveLength(1);
  });
});
