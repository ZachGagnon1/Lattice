import { describe, expect, it } from "vitest";
import { renderMjml } from "./handlebars";

describe("renderMjml logic helpers", () => {
  it("eq matches equal values", async () => {
    expect(
      await renderMjml("{{#if (eq name 'Ann')}}yes{{else}}no{{/if}}", {
        name: "Ann",
      }),
    ).toBe("yes");
    expect(
      await renderMjml("{{#if (eq name 'Ann')}}yes{{else}}no{{/if}}", {
        name: "Bob",
      }),
    ).toBe("no");
  });

  it("eq is strict", async () => {
    expect(
      await renderMjml("{{#if (eq age '18')}}yes{{else}}no{{/if}}", {
        age: 18,
      }),
    ).toBe("no");
  });

  it("not negates eq", async () => {
    expect(
      await renderMjml("{{#if (not (eq name 'Ann'))}}yes{{else}}no{{/if}}", {
        name: "Bob",
      }),
    ).toBe("yes");
  });

  it("gt and lt compare numbers", async () => {
    expect(
      await renderMjml("{{#if (gt age 18)}}adult{{/if}}", { age: 20 }),
    ).toBe("adult");
    expect(
      await renderMjml("{{#if (lt age 18)}}minor{{/if}}", { age: 20 }),
    ).toBe("");
  });

  it("contains works for arrays, strings, and numbers", async () => {
    expect(
      await renderMjml("{{#if (contains tags 'vip')}}yes{{/if}}", {
        tags: ["vip"],
      }),
    ).toBe("yes");
    expect(
      await renderMjml("{{#if (contains city 'ost')}}yes{{/if}}", {
        city: "Boston",
      }),
    ).toBe("yes");
    expect(await renderMjml("{{#if (contains n 5)}}yes{{/if}}", { n: 5 })).toBe(
      "",
    );
  });

  it("and and or take three arguments", async () => {
    expect(
      await renderMjml("{{#if (and a b c)}}yes{{else}}no{{/if}}", {
        a: true,
        b: true,
        c: false,
      }),
    ).toBe("no");
    expect(
      await renderMjml("{{#if (or a b c)}}yes{{else}}no{{/if}}", {
        a: false,
        b: false,
        c: true,
      }),
    ).toBe("yes");
  });

  // Isolation matters because the module registers helpers on its own environment, not on the shared handlebars instance.
  it("does not leak helpers onto the global handlebars", async () => {
    await renderMjml("{{#if (eq name 'Ann')}}yes{{/if}}", { name: "Ann" });
    const handlebars = await import("handlebars");
    expect(
      (handlebars.default as { helpers?: { eq?: unknown } }).helpers?.eq,
    ).toBeUndefined();
  });
});
