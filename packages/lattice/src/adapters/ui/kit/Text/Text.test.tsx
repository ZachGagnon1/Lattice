import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Text } from ".";

describe("Text", () => {
  it("renders a span by default", () => {
    const html = renderToStaticMarkup(<Text>Hi</Text>);
    expect(html.startsWith("<span")).toBe(true);
    expect(html).toContain(">Hi</span>");
  });

  it("renders the element in as", () => {
    const html = renderToStaticMarkup(
      <Text as="a" href="#x">
        Go
      </Text>,
    );
    expect(html.startsWith("<a")).toBe(true);
    expect(html).toContain('href="#x"');
  });

  it("keeps a passed id and class", () => {
    const html = renderToStaticMarkup(
      <Text id="t" className="extra">
        x
      </Text>,
    );
    expect(html).toContain('id="t"');
    expect(html).toContain("extra");
  });
});
