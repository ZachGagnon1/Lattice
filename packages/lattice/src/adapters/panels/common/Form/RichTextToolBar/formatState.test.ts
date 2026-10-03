// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { toHexColor } from "@/shared/utils/colorName";
import { firstFontFamily, findBackgroundColor } from "./formatState";

describe("toHexColor", () => {
  it("converts rgb to hex", () => {
    expect(toHexColor("rgb(255, 0, 0)")).toBe("#FF0000");
  });

  it("returns empty for transparent", () => {
    expect(toHexColor("rgba(0, 0, 0, 0)")).toBe("");
    expect(toHexColor("transparent")).toBe("");
  });

  it("returns empty for invalid values", () => {
    expect(toHexColor("not a color")).toBe("");
    expect(toHexColor(undefined)).toBe("");
  });
});

describe("firstFontFamily", () => {
  it("returns the first family without quotes", () => {
    expect(firstFontFamily('"Times New Roman", serif')).toBe("Times New Roman");
    expect(firstFontFamily("Arial")).toBe("Arial");
  });
});

describe("findBackgroundColor", () => {
  it("finds a color on an ancestor", () => {
    const editable = document.createElement("div");
    editable.style.backgroundColor = "rgb(0, 0, 255)";
    const span = document.createElement("span");
    editable.appendChild(span);
    document.body.appendChild(editable);
    expect(findBackgroundColor(span, editable)).toBe("#0000FF");
  });

  it("stops at the editable", () => {
    const wrapper = document.createElement("div");
    wrapper.style.backgroundColor = "rgb(255, 0, 0)";
    const editable = document.createElement("div");
    const span = document.createElement("span");
    editable.appendChild(span);
    wrapper.appendChild(editable);
    document.body.appendChild(wrapper);
    expect(findBackgroundColor(span, editable)).toBe("");
  });
});
