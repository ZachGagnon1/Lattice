import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import React from "react";
import { ThemeRoot, useColorScheme } from "./ThemeRoot";

const Probe = () => <span>{useColorScheme()}</span>;

describe("ThemeRoot", () => {
  it("defaults to the light scheme", () => {
    const html = renderToStaticMarkup(<ThemeRoot>x</ThemeRoot>);
    expect(html).toContain('class="lattice-theme"');
    expect(html).toContain('data-lattice-color-scheme="light"');
  });

  it("passes the scheme to useColorScheme", () => {
    const html = renderToStaticMarkup(
      <ThemeRoot colorScheme="dark">
        <Probe />
      </ThemeRoot>,
    );
    expect(html).toContain("<span>dark</span>");
  });

  it("defines every color token for the dark scheme", () => {
    const scss = readFileSync(
      new URL("./tokens.scss", import.meta.url),
      "utf8",
    );

    const tokenNames = (mixin: string) => {
      const start = scss.indexOf(`@mixin ${mixin} {`);
      const end = scss.indexOf("}", start);
      const body = scss.slice(start, end);
      return body.match(/--lattice-[a-z0-9-]+/g) ?? [];
    };

    const light = tokenNames("light-colors");
    const dark = tokenNames("dark-colors");

    expect(dark).toEqual(light);
  });
});
