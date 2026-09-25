import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  isSchemaLike,
  schemaToSampleData,
  toVariableSample,
} from "./variableSchema";

/**
 * Find every zod version in the pnpm store.
 *
 * zod is not a dependency of this package, so a bare `import "zod"` does not
 * resolve. The pnpm store still holds the zod versions that other packages
 * install, so the tests load them by path. The real-zod suites skip when the
 * store holds no zod.
 *
 * @returns The zod entry files, keyed by major version label.
 */
function findZodEntries(): Record<string, string> {
  const entries: Record<string, string> = {};

  let dir = __dirname;
  for (let up = 0; up < 8; up++) {
    const store = path.join(dir, "node_modules", ".pnpm");
    if (fs.existsSync(store)) {
      for (const name of fs.readdirSync(store)) {
        const match = /^zod@(\d+)\./.exec(name);
        if (!match) continue;
        const entry = path.join(store, name, "node_modules", "zod", "index.js");
        if (fs.existsSync(entry)) entries[`zod ${match[1]}`] = entry;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return entries;
}

/**
 * Load the `z` namespace from a zod entry file.
 *
 * @param entry - The absolute path of the zod entry file.
 * @returns The `z` namespace.
 */
async function loadZod(entry: string): Promise<any> {
  const mod: any = await import(/* @vite-ignore */ entry);
  return mod.z ?? mod.default?.z ?? mod.default;
}

const zodEntries = findZodEntries();
const zodVersions: Array<[string, any]> = [];
for (const [label, entry] of Object.entries(zodEntries)) {
  zodVersions.push([label, await loadZod(entry)]);
}

describe("isSchemaLike with hand-built stubs", () => {
  it("returns false for a plain sample object", () => {
    expect(isSchemaLike({ firstName: "John", age: 30 })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isSchemaLike(null)).toBe(false);
    expect(isSchemaLike(undefined)).toBe(false);
    expect(isSchemaLike("firstName")).toBe(false);
    expect(isSchemaLike(42)).toBe(false);
  });

  it("returns false for a plain object that happens to hold shape and element keys", () => {
    expect(isSchemaLike({ shape: { width: 10 }, element: "div" })).toBe(false);
  });

  it("returns true for a stub with a callable safeParse", () => {
    expect(isSchemaLike({ safeParse: () => ({ success: true }) })).toBe(true);
  });

  it("returns true for a stub with a callable unwrap", () => {
    expect(isSchemaLike({ unwrap: () => ({}) })).toBe(true);
  });

  it("returns true for a stub with parse plus a shape record", () => {
    expect(isSchemaLike({ parse: () => null, shape: { a: {} } })).toBe(true);
  });

  it("returns true for a stub with parse plus an element", () => {
    expect(isSchemaLike({ parse: () => null, element: {} })).toBe(true);
  });
});

describe("schemaToSampleData with hand-built stubs", () => {
  it("uses the field name as the leaf placeholder", () => {
    const schema = {
      safeParse: () => null,
      shape: { firstName: { safeParse: () => null } },
    };
    expect(schemaToSampleData(schema)).toEqual({ firstName: "firstName" });
  });

  it("uses an empty string for a leaf at the root", () => {
    expect(schemaToSampleData({ safeParse: () => null })).toBe("");
  });

  it("does not throw when unwrap throws", () => {
    const schema = {
      safeParse: () => null,
      shape: {
        broken: {
          unwrap: () => {
            throw new Error("boom");
          },
        },
      },
    };
    expect(() => schemaToSampleData(schema)).not.toThrow();
    expect(schemaToSampleData(schema)).toEqual({ broken: "broken" });
  });

  it("does not throw when a shape getter throws", () => {
    const broken = {
      safeParse: () => null,
      get shape(): Record<string, unknown> {
        throw new Error("boom");
      },
    };
    expect(() => schemaToSampleData(broken)).not.toThrow();
    expect(schemaToSampleData(broken)).toBe("");
  });

  it("stops a wrapper that unwraps forever", () => {
    const cyclic: { unwrap: () => unknown } = { unwrap: () => ({}) };
    const other: { unwrap: () => unknown } = { unwrap: () => cyclic };
    cyclic.unwrap = () => other;
    expect(schemaToSampleData(cyclic)).toBe("");
  });

  it("falls back to removeDefault and removeCatch", () => {
    const inner = {
      safeParse: () => null,
      shape: { a: { parse: () => null } },
    };
    const withDefault = { removeDefault: () => inner };
    const withCatch = { removeCatch: () => inner };
    expect(schemaToSampleData(withDefault)).toEqual({ a: "a" });
    expect(schemaToSampleData(withCatch)).toEqual({ a: "a" });
  });

  it("honours arrayLength", () => {
    const schema = { element: { parse: () => null }, parse: () => null };
    expect(schemaToSampleData(schema, { arrayLength: 3 })).toEqual([
      "",
      "",
      "",
    ]);
    expect(schemaToSampleData(schema, { arrayLength: 0 })).toEqual([]);
  });
});

describe("toVariableSample", () => {
  it("passes a plain object through untouched", () => {
    const sample = { firstName: "John", nested: { city: "Kyiv" } };
    expect(toVariableSample(sample)).toBe(sample);
    expect(toVariableSample(sample)).toEqual({
      firstName: "John",
      nested: { city: "Kyiv" },
    });
  });

  it("returns an empty object for anything else", () => {
    expect(toVariableSample(null)).toEqual({});
    expect(toVariableSample(7)).toEqual({});
    expect(toVariableSample("firstName")).toEqual({});
    expect(toVariableSample([1, 2])).toEqual({});
  });

  it("returns an empty object when a schema root is an array", () => {
    const schema = { safeParse: () => null, element: { parse: () => null } };
    expect(toVariableSample(schema)).toEqual({});
  });

  it("converts a stub schema", () => {
    const schema = {
      safeParse: () => null,
      shape: { firstName: { safeParse: () => null } },
    };
    expect(toVariableSample(schema)).toEqual({ firstName: "firstName" });
  });
});

it("finds at least one zod version in the pnpm store", () => {
  expect(Object.keys(zodEntries).length).toBeGreaterThan(0);
});

describe.each(zodVersions)("%s", (_label, z) => {
  it("builds sample data for a flat object", () => {
    const schema = z.object({
      firstName: z.string(),
      age: z.number(),
      active: z.boolean(),
    });
    expect(schemaToSampleData(schema)).toEqual({
      firstName: "firstName",
      age: "age",
      active: "active",
    });
  });

  it("builds sample data for nested objects", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({ city: z.string() }),
      }),
    });
    expect(schemaToSampleData(schema)).toEqual({
      user: { name: "name", address: { city: "city" } },
    });
  });

  it("builds an array of objects with arrayLength entries", () => {
    const schema = z.object({
      mentees: z.array(z.object({ name: z.string(), score: z.number() })),
    });
    expect(schemaToSampleData(schema)).toEqual({
      mentees: [
        { name: "name", score: "score" },
        { name: "name", score: "score" },
      ],
    });
    expect(schemaToSampleData(schema, { arrayLength: 3 })).toEqual({
      mentees: [
        { name: "name", score: "score" },
        { name: "name", score: "score" },
        { name: "name", score: "score" },
      ],
    });
  });

  it("builds an array of primitives", () => {
    const schema = z.object({ tags: z.array(z.string()) });
    expect(schemaToSampleData(schema)).toEqual({ tags: ["tags", "tags"] });
  });

  it("unwraps optional, nullable and default wrappers", () => {
    const schema = z.object({
      a: z.string().optional(),
      b: z.string().nullable(),
      c: z.string().default("x"),
      d: z.object({ inner: z.string() }).optional(),
      e: z.object({ inner: z.string() }).default({ inner: "x" }),
      f: z.array(z.object({ inner: z.string() })).optional(),
    });
    expect(schemaToSampleData(schema)).toEqual({
      a: "a",
      b: "b",
      c: "c",
      d: { inner: "inner" },
      e: { inner: "inner" },
      f: [{ inner: "inner" }, { inner: "inner" }],
    });
  });

  it("unwraps a readonly wrapper", () => {
    const schema = z.object({ a: z.object({ inner: z.string() }).readonly() });
    expect(schemaToSampleData(schema)).toEqual({ a: { inner: "inner" } });
  });

  it("unwraps a chain of wrappers", () => {
    const schema = z.object({
      a: z.object({ inner: z.string() }).optional().nullable(),
    });
    expect(schemaToSampleData(schema)).toEqual({ a: { inner: "inner" } });
  });

  it("stops at maxDepth", () => {
    const schema = z.object({
      l1: z.object({ l2: z.object({ l3: z.object({ l4: z.string() }) }) }),
    });
    expect(schemaToSampleData(schema, { maxDepth: 2 })).toEqual({
      l1: { l2: "l2" },
    });
    expect(schemaToSampleData(schema, { maxDepth: 0 })).toBe("");
  });

  it("stops a deeply nested schema at the default maxDepth", () => {
    let schema = z.object({ leaf: z.string() });
    for (let level = 0; level < 20; level++) {
      schema = z.object({ n: schema });
    }
    let node: any = schemaToSampleData(schema);
    let depth = 0;
    while (typeof node === "object" && node !== null) {
      node = node.n ?? node.leaf;
      depth++;
    }
    expect(typeof node).toBe("string");
    expect(depth).toBe(8);
  });

  it("classifies real schemas as schema-like", () => {
    expect(isSchemaLike(z.object({ a: z.string() }))).toBe(true);
    expect(isSchemaLike(z.array(z.string()))).toBe(true);
    expect(isSchemaLike(z.string())).toBe(true);
    expect(isSchemaLike(z.string().optional())).toBe(true);
    expect(isSchemaLike(z.string().default("x"))).toBe(true);
  });

  it("converts a real schema through toVariableSample", () => {
    const schema = z.object({
      firstName: z.string(),
      mentees: z.array(z.object({ name: z.string() })),
    });
    expect(toVariableSample(schema)).toEqual({
      firstName: "firstName",
      mentees: [{ name: "name" }, { name: "name" }],
    });
  });
});
