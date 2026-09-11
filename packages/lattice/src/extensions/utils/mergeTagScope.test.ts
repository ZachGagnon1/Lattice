import { describe, expect, it } from "vitest";

import { BasicType } from "@/core/constants";

import {
  getLoopScopes,
  getScopedMergeTags,
  isExpandable,
} from "./mergeTagScope";

/** Build a plain block shaped like the real form state. */
function block(type: string, value: any, children: any[] = []) {
  return { type, data: { value }, attributes: {}, children };
}

/** Build a for-loop block. */
function forLoop(dataSource: string, itemAs: string, children: any[] = []) {
  return block(BasicType.FOR_LOOP, { dataSource, itemAs }, children);
}

/** Build a table block with a row loop. */
function table(source: string, itemAs: string, children: any[] = []) {
  return block(
    BasicType.TABLE,
    { content: "", rowLoop: { source, itemAs, headerRows: 1 } },
    children,
  );
}

/** Build a text block. */
function text() {
  return block(BasicType.TEXT, { content: "hello" });
}

/** Build the form values around a page whose children are given. */
function values(children: any[]) {
  return { content: block(BasicType.PAGE, {}, children) };
}

const mergeTags = {
  products: [{ name: "Widget", price: 10, variants: [{ sku: "A1" }] }],
  user: { first: "Ada" },
  company: "ACME",
};

describe("isExpandable", () => {
  it("expands a plain object", () => {
    expect(isExpandable({ a: 1 })).toBe(true);
  });

  it("does not expand an array", () => {
    expect(isExpandable([{ a: 1 }])).toBe(false);
  });

  it("does not expand a primitive", () => {
    expect(isExpandable("x")).toBe(false);
    expect(isExpandable(undefined)).toBe(false);
  });
});

describe("getLoopScopes", () => {
  it("returns no scope at the page root", () => {
    expect(getLoopScopes(mergeTags, values([]), "content")).toEqual([]);
  });

  it("finds one loop above the focused block", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(scopes).toHaveLength(1);
    expect(scopes[0].prefix).toBe("product");
    expect(scopes[0].source).toBe("products");
    expect(scopes[0].idx).toBe("content.children.[0]");
    expect(scopes[0].resolved).toBe(true);
    expect(scopes[0].sample).toEqual(mergeTags.products[0]);
  });

  it("skips the loop declared by the focused block by default", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    expect(getLoopScopes(mergeTags, tree, "content.children.[0]")).toEqual([]);
  });

  it("includes the loop declared by the focused block with includeSelfLoop", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    const scopes = getLoopScopes(mergeTags, tree, "content.children.[0]", {
      includeSelfLoop: true,
    });

    expect(scopes).toHaveLength(1);
    expect(scopes[0].prefix).toBe("product");
  });

  it("resolves an inner source that names an outer alias", () => {
    const tree = values([
      forLoop("products", "product", [
        forLoop("product.variants", "variant", [text()]),
      ]),
    ]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0].children.[0]",
    );

    expect(scopes.map((scope) => scope.prefix)).toEqual([
      "variant",
      "product",
    ]);
    expect(scopes[0].resolved).toBe(true);
    expect(scopes[0].sample).toEqual({ sku: "A1" });
  });

  it("resolves a source that starts with this", () => {
    const tree = values([
      forLoop("products", "", [forLoop("this.variants", "variant", [text()])]),
    ]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0].children.[0]",
    );

    expect(scopes.map((scope) => scope.prefix)).toEqual(["variant"]);
    expect(scopes[0].sample).toEqual({ sku: "A1" });
  });

  it("drops an outer scope that an inner scope shadows", () => {
    const tree = values([
      forLoop("products", "item", [forLoop("user", "item", [text()])]),
    ]);
    const scopes = getLoopScopes(
      { ...mergeTags, user: [{ first: "Ada" }] },
      tree,
      "content.children.[0].children.[0].children.[0]",
    );

    expect(scopes).toHaveLength(1);
    expect(scopes[0].sample).toEqual({ first: "Ada" });
  });

  it("drops a blank alias once another loop nests inside it", () => {
    const tree = values([
      forLoop("products", "", [forLoop("products", "product", [text()])]),
    ]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0].children.[0]",
    );

    expect(scopes.map((scope) => scope.prefix)).toEqual(["product"]);
  });

  it("registers an unresolved source anyway", () => {
    const tree = values([forLoop("missing", "row", [text()])]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(scopes).toHaveLength(1);
    expect(scopes[0].resolved).toBe(false);
    expect(scopes[0].sample).toBeUndefined();
  });

  it("treats a non-array source as unresolved", () => {
    const tree = values([forLoop("user", "row", [text()])]);
    const scopes = getLoopScopes(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(scopes[0].resolved).toBe(false);
    expect(scopes[0].sample).toBeUndefined();
  });

  it("treats an empty array as unresolved", () => {
    const tree = values([forLoop("empty", "row", [text()])]);
    const scopes = getLoopScopes(
      { empty: [] },
      tree,
      "content.children.[0].children.[0]",
    );

    expect(scopes[0].resolved).toBe(false);
    expect(scopes[0].sample).toBeUndefined();
  });

  it("skips a loop with a blank source", () => {
    const tree = values([forLoop("", "row", [text()])]);
    expect(
      getLoopScopes(mergeTags, tree, "content.children.[0].children.[0]"),
    ).toEqual([]);
  });

  it("does not leak a table row loop to a descendant", () => {
    const tree = values([table("products", "product", [text()])]);
    expect(
      getLoopScopes(mergeTags, tree, "content.children.[0].children.[0]"),
    ).toEqual([]);
  });

  it("reads a table row loop for the table itself", () => {
    const tree = values([table("products", "product")]);
    const scopes = getLoopScopes(mergeTags, tree, "content.children.[0]", {
      includeSelfLoop: true,
    });

    expect(scopes).toHaveLength(1);
    expect(scopes[0].prefix).toBe("product");
    expect(scopes[0].sample).toEqual(mergeTags.products[0]);
  });

  it("ignores a table row loop without includeSelfLoop", () => {
    const tree = values([table("products", "product")]);
    expect(getLoopScopes(mergeTags, tree, "content.children.[0]")).toEqual([]);
  });

  it("does not throw on malformed block data", () => {
    const tree = {
      content: {
        type: BasicType.PAGE,
        data: {},
        attributes: {},
        children: [{ type: BasicType.FOR_LOOP }, null],
      },
    } as any;

    expect(() =>
      getLoopScopes(mergeTags, tree, "content.children.[0].children.[0]"),
    ).not.toThrow();
    expect(
      getLoopScopes(mergeTags, tree, "content.children.[0].children.[0]"),
    ).toEqual([]);
  });

  it("returns three scopes for three nested loops", () => {
    const tags = {
      a: [{ b: [{ c: [{ leaf: 1 }] }] }],
    };
    const tree = values([
      forLoop("a", "x", [
        forLoop("x.b", "y", [forLoop("y.c", "z", [text()])]),
      ]),
    ]);
    const scopes = getLoopScopes(
      tags,
      tree,
      "content.children.[0].children.[0].children.[0].children.[0]",
    );

    expect(scopes.map((scope) => scope.prefix)).toEqual(["z", "y", "x"]);
  });
});

describe("getScopedMergeTags", () => {
  it("returns only the globals when there is no loop", () => {
    const result = getScopedMergeTags(mergeTags, values([]), "content");

    expect(result.scopes).toEqual([]);
    expect(result.roots.map((root) => root.displayPath)).toEqual([
      "products",
      "user",
      "company",
    ]);
    expect(result.roots.every((root) => root.kind === "global")).toBe(true);
    expect(result.tags).toEqual(mergeTags);
  });

  it("puts the innermost loop fields first, bare and alias qualified", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.roots.slice(0, 3)).toEqual([
      {
        displayPath: "name",
        emitPath: "product.name",
        value: "Widget",
        kind: "loop-field",
        scope: result.scopes[0],
      },
      {
        displayPath: "price",
        emitPath: "product.price",
        value: 10,
        kind: "loop-field",
        scope: result.scopes[0],
      },
      {
        displayPath: "variants",
        emitPath: "product.variants",
        value: [{ sku: "A1" }],
        kind: "loop-field",
        scope: result.scopes[0],
      },
    ]);
    expect(result.roots.slice(3).map((root) => root.displayPath)).toEqual([
      "products",
      "user",
      "company",
    ]);
  });

  it("emits this qualified paths for a blank alias", () => {
    const tree = values([forLoop("products", "", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.roots[0].displayPath).toBe("name");
    expect(result.roots[0].emitPath).toBe("this.name");
  });

  it("groups an outer loop and flattens the innermost one", () => {
    const tree = values([
      forLoop("products", "product", [
        forLoop("product.variants", "variant", [text()]),
      ]),
    ]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0].children.[0]",
    );

    expect(
      result.roots.map((root) => [root.kind, root.displayPath, root.emitPath]),
    ).toEqual([
      ["loop-field", "sku", "variant.sku"],
      ["loop-group", "product", "product"],
      ["global", "products", "products"],
      ["global", "user", "user"],
      ["global", "company", "company"],
    ]);
  });

  it("orders three nested loops as flat, then groups, then globals", () => {
    const tags = { a: [{ b: [{ c: [{ leaf: 1 }] }] }] };
    const tree = values([
      forLoop("a", "x", [
        forLoop("x.b", "y", [forLoop("y.c", "z", [text()])]),
      ]),
    ]);
    const result = getScopedMergeTags(
      tags,
      tree,
      "content.children.[0].children.[0].children.[0].children.[0]",
    );

    expect(
      result.roots.map((root) => [root.kind, root.displayPath]),
    ).toEqual([
      ["loop-field", "leaf"],
      ["loop-group", "y"],
      ["loop-group", "x"],
      ["global", "a"],
    ]);
  });

  it("emits one loop-item entry for an array of primitives", () => {
    const tags = { tags: ["vip", "new"] };
    const tree = values([forLoop("tags", "tag", [text()])]);
    const result = getScopedMergeTags(
      tags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.roots[0]).toMatchObject({
      displayPath: "tag",
      emitPath: "tag",
      value: "vip",
      kind: "loop-item",
    });
  });

  it("emits one loop-item entry for an unresolved source", () => {
    const tree = values([forLoop("missing", "row", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.roots[0]).toMatchObject({
      displayPath: "row",
      emitPath: "row",
      value: undefined,
      kind: "loop-item",
    });
  });

  it("emits a this loop-item entry for a blank alias that does not resolve", () => {
    const tree = values([forLoop("missing", "", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.roots[0]).toMatchObject({
      displayPath: "this",
      emitPath: "this",
      kind: "loop-item",
    });
  });

  it("shows both the loop field and the shadowed root tag", () => {
    const tags = { company: [{ company: "Inner" }], other: 1 };
    const tree = values([forLoop("company", "company", [text()])]);
    const result = getScopedMergeTags(
      tags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(
      result.roots.map((root) => [root.kind, root.displayPath, root.emitPath]),
    ).toEqual([
      ["loop-field", "company", "company.company"],
      ["global", "company", "company"],
      ["global", "other", "other"],
    ]);
  });

  it("builds a flat tags map from the scopes and the globals", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect(result.tags.product).toEqual(mergeTags.products[0]);
    expect(result.tags.products).toEqual(mergeTags.products);
    expect(result.tags.company).toBe("ACME");
  });

  it("omits an unresolved scope from the flat tags map", () => {
    const tree = values([forLoop("missing", "row", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );

    expect("row" in result.tags).toBe(false);
  });

  it("never expands an array into indexed children", () => {
    const tree = values([forLoop("products", "product", [text()])]);
    const result = getScopedMergeTags(
      mergeTags,
      tree,
      "content.children.[0].children.[0]",
    );
    const variants = result.roots.find(
      (root) => root.displayPath === "variants",
    );

    expect(variants).toBeDefined();
    expect(isExpandable(variants!.value)).toBe(false);
  });
});
