/**
 * Derive picker data and preview sample data from a consumer's variable
 * schema.
 *
 * ## Why there is no zod import here
 *
 * The library never imports zod — not as a dependency, not as a peer
 * dependency, and not as a type-only import. A type-only import still has to
 * resolve at build time, so a consumer without zod installed would fail to
 * build. This module duck-types the public zod surface instead:
 *
 * - an object schema exposes `shape`, a record of child schemas;
 * - an array schema exposes `element`, the item schema;
 * - a wrapper schema (optional, nullable, default, readonly, catch, brand)
 *   exposes a method that returns the inner schema.
 *
 * These members are public API in zod 3 and zod 4. The module never reads
 * `_def`, `_zod`, or any other internal, because zod 4 restructured them.
 *
 * ## The leaf placeholder is always a string
 *
 * The public zod API does not report the primitive type of a leaf schema
 * without internals. A leaf therefore always becomes a string. The field name
 * is the placeholder value, because `"firstName"` reads better in a preview
 * than an empty string.
 *
 * The consequence: a numeric comparison in a Condition block previews against
 * a string. A date comparison does the same. The consumer corrects this with
 * `previewOverride`, which supplies real values for the fields that need
 * them.
 *
 * ## Known difference between zod majors
 *
 * zod 3 gives `ZodRecord` an `element` getter, so `z.record(...)` produces an
 * array sample under zod 3 and a string leaf under zod 4. There is no public
 * way to tell a record from an array, so the module accepts the difference.
 *
 * @packageDocumentation
 */

/**
 * A duck-typed zod schema. The library never imports zod.
 *
 * Every member is optional, because the module inspects unknown values and
 * only reads the members that are present.
 */
export interface SchemaLike {
  /** Child schemas of an object schema, keyed by field name. */
  shape?: Record<string, unknown>;
  /** The item schema of an array schema. */
  element?: unknown;
  /** Returns the inner schema of a wrapper schema. */
  unwrap?: () => unknown;
}

/** Options that control the generated sample data. */
export interface SampleOptions {
  /** How many entries to put in a generated array. Default 2. */
  arrayLength?: number;
  /** Recursion guard. Default 8. */
  maxDepth?: number;
}

/** The default number of entries in a generated array. */
const DEFAULT_ARRAY_LENGTH = 2;

/** The default recursion limit. */
const DEFAULT_MAX_DEPTH = 8;

/**
 * The limit on consecutive unwrap steps at one level.
 *
 * A wrapper chain such as `.optional().nullable().default(x)` is short in
 * practice. The limit stops a schema that unwraps to itself forever.
 */
const MAX_UNWRAP_HOPS = 16;

/**
 * Public methods that return the inner schema of a wrapper.
 *
 * zod 4 gives every wrapper an `unwrap` method. zod 3 does not: its
 * `ZodDefault` exposes `removeDefault` and its `ZodCatch` exposes
 * `removeCatch`. All three names are public API, so the module tries each in
 * turn.
 */
const UNWRAP_METHODS = ["unwrap", "removeDefault", "removeCatch"] as const;

/** Marks an unwrap attempt that produced no inner schema. */
const UNWRAP_FAILED = Symbol("unwrapFailed");

/**
 * Test whether a value can carry properties.
 *
 * @param value - The value to test.
 * @returns True for a non-null object or a function.
 */
function isObjectLike(value: unknown): value is Record<string, unknown> {
  return (
    (typeof value === "object" && value !== null) || typeof value === "function"
  );
}

/**
 * Read a property without letting a throwing getter escape.
 *
 * A schema can define `shape` as a getter. A getter can throw, for example on
 * a lazy schema with a broken factory.
 *
 * @param target - The object to read from.
 * @param name - The property name.
 * @returns The property value, or `undefined` when the read fails.
 */
function readProp(target: unknown, name: string): unknown {
  if (!isObjectLike(target)) return undefined;
  try {
    return (target as Record<string, unknown>)[name];
  } catch {
    return undefined;
  }
}

/**
 * Test whether a value is a usable `shape` record.
 *
 * @param value - The candidate shape.
 * @returns True for a non-null, non-array object.
 */
function isShapeRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Test whether a value is a plain data object.
 *
 * @param value - The value to test.
 * @returns True for a non-null, non-array object.
 */
function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * True when the value looks like a zod schema rather than a plain sample
 * object.
 *
 * The heuristic, in order:
 *
 * 1. A value that is not an object or a function is not a schema.
 * 2. A callable `safeParse` is a strong positive signal. Every zod schema has
 *    one, and a plain sample object does not.
 * 3. A callable `unwrap` is also a strong positive signal, for the same
 *    reason.
 * 4. A callable `parse` together with a `shape` record or an `element` is a
 *    schema. This accepts a hand-built duck-typed schema.
 * 5. Anything else is a plain sample object.
 *
 * Step 5 is the safety bias. A plain sample object can hold a key named
 * `shape` or `element` by chance, and treating that object as a schema would
 * throw away the consumer's real data. A schema with no parse method at all
 * is far less likely than a data object with a `shape` key, so the ambiguous
 * case resolves to "plain data".
 *
 * @param value - The value to classify.
 * @returns True when the value looks like a schema.
 */
export function isSchemaLike(value: unknown): boolean {
  if (!isObjectLike(value)) return false;

  if (typeof readProp(value, "safeParse") === "function") return true;
  if (typeof readProp(value, "unwrap") === "function") return true;

  if (typeof readProp(value, "parse") === "function") {
    if (isShapeRecord(readProp(value, "shape"))) return true;
    if (readProp(value, "element") !== undefined) return true;
  }

  return false;
}

/**
 * Read the inner schema of a wrapper schema.
 *
 * @param node - The candidate wrapper.
 * @returns The inner schema, or `UNWRAP_FAILED` when there is none.
 */
function unwrapOnce(node: unknown): unknown {
  for (const name of UNWRAP_METHODS) {
    const method = readProp(node, name);
    if (typeof method !== "function") continue;
    try {
      const inner = (method as () => unknown).call(node);
      if (inner === undefined || inner === null) continue;
      if (inner === node) continue;
      return inner;
    } catch {
      // A wrapper that throws is treated as a leaf. Try the next name.
      continue;
    }
  }
  return UNWRAP_FAILED;
}

/**
 * Build the placeholder value for a leaf schema.
 *
 * @param key - The field name that holds this leaf, when there is one.
 * @returns The field name, or an empty string at the root.
 */
function leafValue(key: string | undefined): string {
  return key ?? "";
}

/** Resolved options with every field filled in. */
interface ResolvedOptions {
  arrayLength: number;
  maxDepth: number;
}

/**
 * Generate the sample value for one schema node.
 *
 * @param node - The schema node.
 * @param key - The field name that holds this node, when there is one.
 * @param depth - The current recursion depth.
 * @param options - The resolved sample options.
 * @returns The generated sample value.
 */
function generate(
  node: unknown,
  key: string | undefined,
  depth: number,
  options: ResolvedOptions,
): unknown {
  if (depth >= options.maxDepth) return leafValue(key);

  let current = node;

  for (let hop = 0; hop < MAX_UNWRAP_HOPS; hop++) {
    if (!isObjectLike(current)) return leafValue(key);

    // An object schema wins over everything else.
    const shape = readProp(current, "shape");
    if (isShapeRecord(shape)) {
      const result: Record<string, unknown> = {};
      for (const field of Object.keys(shape)) {
        result[field] = generate(shape[field], field, depth + 1, options);
      }
      return result;
    }

    // An array schema is checked before unwrap. zod 4 gives its array schema
    // an `unwrap` method as well, so unwrap-first would turn an array into a
    // single item.
    const element = readProp(current, "element");
    if (element !== undefined && element !== null) {
      const items: unknown[] = [];
      for (let index = 0; index < options.arrayLength; index++) {
        items.push(generate(element, key, depth + 1, options));
      }
      return items;
    }

    const inner = unwrapOnce(current);
    if (inner === UNWRAP_FAILED) return leafValue(key);
    current = inner;
  }

  return leafValue(key);
}

/**
 * Normalise the caller's options.
 *
 * @param options - The caller's options.
 * @returns Options with valid, filled-in values.
 */
function resolveOptions(options?: SampleOptions): ResolvedOptions {
  const rawLength = options?.arrayLength;
  const rawDepth = options?.maxDepth;

  const arrayLength =
    typeof rawLength === "number" && Number.isFinite(rawLength)
      ? Math.max(0, Math.floor(rawLength))
      : DEFAULT_ARRAY_LENGTH;

  const maxDepth =
    typeof rawDepth === "number" && Number.isFinite(rawDepth)
      ? Math.max(0, Math.floor(rawDepth))
      : DEFAULT_MAX_DEPTH;

  return { arrayLength, maxDepth };
}

/**
 * Build sample data from a schema.
 *
 * A schema carries no values, but the preview needs data to render. Every
 * leaf becomes a string that holds its own field name. See the module header
 * for why the placeholder cannot carry the real primitive type.
 *
 * The function never throws. A schema that throws from a getter or from an
 * unwrap method degrades to a leaf placeholder.
 *
 * @param schema - The duck-typed schema to read.
 * @param options - Controls the array length and the recursion limit.
 * @returns The generated sample value: an object, an array, or a string.
 */
export function schemaToSampleData(
  schema: unknown,
  options?: SampleOptions,
): unknown {
  try {
    return generate(schema, undefined, 0, resolveOptions(options));
  } catch {
    return "";
  }
}

/**
 * Normalise either input into the plain sample object the picker consumes.
 *
 * A plain object passes through unchanged. A schema becomes generated sample
 * data. Anything else, including a schema whose root is an array, becomes an
 * empty object, because the picker needs named top-level fields.
 *
 * @param input - A schema or a plain sample object.
 * @param options - Controls the array length and the recursion limit.
 * @returns A plain object of sample data.
 */
export function toVariableSample(
  input: unknown,
  options?: SampleOptions,
): Record<string, any> {
  if (isSchemaLike(input)) {
    const sample = schemaToSampleData(input, options);
    return isPlainObject(sample) ? sample : {};
  }

  if (isPlainObject(input)) return input;

  return {};
}
