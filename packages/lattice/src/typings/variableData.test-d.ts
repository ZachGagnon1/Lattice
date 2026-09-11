/**
 * Type level tests for `./variableData`.
 *
 * These assertions run in the compiler, not in vitest. The vitest `include` is
 * `src/**\/*.test.ts`, which a `.test-d.ts` name does not match, so the runner
 * skips this file. `tsc --noEmit` covers all of `src`, so every broken
 * assertion becomes a build error here.
 */

import { z } from "zod";
import * as zmini from "zod/mini";

import {
  ArrayVariablePath,
  InferSchemaOutput,
  LoopItem,
  VariableAt,
  VariableDataOf,
  VariablePath,
} from "./variableData";

/** Fail to compile unless `T` is exactly `true`. */
type Expect<T extends true> = T;

/** `true` only when `X` and `Y` are the same type, invariantly. */
type Equal<X, Y> =
  (<V>() => V extends X ? 1 : 2) extends <V>() => V extends Y ? 1 : 2
    ? true
    : false;

/* -------------------------------------------------------------------------
 * Fixtures
 * ---------------------------------------------------------------------- */

/** A flat shape, with an optional and a nullable member. */
interface Flat {
  firstName?: string;
  lastName: string;
  age: number | null;
}

/** A nested shape, with arrays at two levels. */
interface Nested {
  user: {
    email: string;
    address: { city: string };
  };
  products: { name: string; price: number }[];
  tags: readonly string[];
  pair: [string, number];
  readonly locale: string;
}

/** A self referential shape. It must not hang the compiler. */
interface Recursive {
  name: string;
  child: Recursive;
}

/* -------------------------------------------------------------------------
 * VariablePath
 * ---------------------------------------------------------------------- */

/** A flat object gives one path per key, optional and nullable included. */
type FlatPaths = Expect<
  Equal<VariablePath<Flat>, "firstName" | "lastName" | "age">
>;

/** A nested object gives the key and the dotted path below it. */
type NestedPaths = Expect<
  Equal<
    VariablePath<Nested>,
    | "user"
    | "user.email"
    | "user.address"
    | "user.address.city"
    | "products"
    | "tags"
    | "pair"
    | "locale"
  >
>;

/** An array property yields only its key. No indexed path exists. */
type ArrayIsTerminal = Expect<
  Equal<VariablePath<{ products: { name: string }[] }>, "products">
>;

/** A tuple counts as an array, so it is terminal too. */
type TupleIsTerminal = Expect<
  Equal<VariablePath<{ pair: [string, number] }>, "pair">
>;

/** A readonly array is terminal in the same way. */
type ReadonlyArrayIsTerminal = Expect<
  Equal<VariablePath<{ tags: readonly string[] }>, "tags">
>;

/** An optional object property still expands. */
type OptionalObjectExpands = Expect<
  Equal<VariablePath<{ user?: { email: string } }>, "user" | "user.email">
>;

/** A nullable object property still expands. */
type NullableObjectExpands = Expect<
  Equal<VariablePath<{ user: { email: string } | null }>, "user" | "user.email">
>;

/** The loose default shape degrades to `string`, never to `never`. */
type LooseIsString = Expect<Equal<VariablePath<Record<string, any>>, string>>;

/** `never` would break the loose default. Prove it is not `never`. */
type LooseIsNotNever = Expect<
  Equal<
    [VariablePath<Record<string, any>>] extends [never] ? true : false,
    false
  >
>;

/**
 * The depth guard stops a self referential walk.
 *
 * A budget of 2 allows two steps below the root keys, so the deepest path has
 * three segments.
 */
type RecursiveTerminates = Expect<
  Equal<
    VariablePath<Recursive, 2>,
    | "name"
    | "child"
    | "child.name"
    | "child.child"
    | "child.child.name"
    | "child.child.child"
  >
>;

/** The default budget of 5 also terminates, and the result is a string union. */
type RecursiveDefaultTerminates = Expect<
  Equal<VariablePath<Recursive> extends string ? true : false, true>
>;

/** A budget of zero still gives the root keys, but never descends. */
type ZeroDepth = Expect<
  Equal<
    VariablePath<Nested, 0>,
    "user" | "products" | "tags" | "pair" | "locale"
  >
>;

/** An exhausted budget gives nothing at all. */
type ExhaustedDepth = Expect<Equal<VariablePath<Nested, never>, never>>;

/** A primitive has no paths. */
type PrimitiveHasNoPaths = Expect<Equal<VariablePath<string>, never>>;

/* -------------------------------------------------------------------------
 * ArrayVariablePath
 * ---------------------------------------------------------------------- */

/** Only the array keys survive. */
type ArrayPaths = Expect<
  Equal<ArrayVariablePath<Nested>, "products" | "tags" | "pair">
>;

/** A nested array is found through a plain object. */
type NestedArrayPaths = Expect<
  Equal<
    ArrayVariablePath<{ user: { orders: number[]; email: string } }>,
    "user.orders"
  >
>;

/** A shape with no array has no loop source. */
type NoArrayPaths = Expect<Equal<ArrayVariablePath<Flat>, never>>;

/** An optional array still counts. */
type OptionalArrayCounts = Expect<
  Equal<ArrayVariablePath<{ products?: string[] }>, "products">
>;

/** The loose default shape accepts any loop source. */
type LooseArrayIsString = Expect<
  Equal<ArrayVariablePath<Record<string, any>>, string>
>;

/* -------------------------------------------------------------------------
 * VariableAt
 * ---------------------------------------------------------------------- */

/** A nested path resolves to the leaf type. */
type AtNested = Expect<Equal<VariableAt<Nested, "user.address.city">, string>>;

/** A single segment resolves to the property type. */
type AtRoot = Expect<
  Equal<VariableAt<Nested, "products">, { name: string; price: number }[]>
>;

/** An optional container resolves through. */
type AtThroughOptional = Expect<
  Equal<VariableAt<{ user?: { email: string } }, "user.email">, string>
>;

/** An optional leaf keeps its `undefined`. */
type AtOptionalLeaf = Expect<
  Equal<
    VariableAt<{ user: { email?: string } }, "user.email">,
    string | undefined
  >
>;

/** A path that does not exist resolves to `never`. */
type AtMissing = Expect<Equal<VariableAt<Nested, "user.nope">, never>>;

/* -------------------------------------------------------------------------
 * LoopItem
 * ---------------------------------------------------------------------- */

/** The item shape inside a loop is the array element. */
type ItemOfProducts = Expect<
  Equal<LoopItem<Nested, "products">, { name: string; price: number }>
>;

/** A readonly array gives the same element type. */
type ItemOfReadonly = Expect<Equal<LoopItem<Nested, "tags">, string>>;

/** A nested array resolves the same way. */
type ItemOfNested = Expect<
  Equal<LoopItem<{ user: { orders: number[] } }, "user.orders">, number>
>;

/** An optional array still gives its element type. */
type ItemOfOptional = Expect<
  Equal<LoopItem<{ products?: { id: string }[] }, "products">, { id: string }>
>;

/** A non array path is not a loop source. */
type ItemOfNonArray = Expect<Equal<LoopItem<Nested, "user.email">, never>>;

/* -------------------------------------------------------------------------
 * InferSchemaOutput and VariableDataOf
 * ---------------------------------------------------------------------- */

/**
 * A real zod schema, built with the classic `zod` entry point.
 *
 * zod is a devDependency of this package, and it is used ONLY here. The
 * library itself never imports it. See `src/utils/variableSchema.ts` for why.
 *
 * The shape is realistic on purpose. It holds a nested object, an array of
 * objects, an optional field, and a field with a default.
 */
const contactSchema = z.object({
  firstName: z.string(),
  age: z.number(),
  nickname: z.string().optional(),
  locale: z.string().default("en"),
  address: z.object({
    city: z.string(),
    zip: z.string(),
  }),
  orders: z.array(
    z.object({
      id: z.string(),
      total: z.number(),
    }),
  ),
});

/** The data shape of {@link contactSchema}, as zod itself reports it. */
type ContactOutput = z.infer<typeof contactSchema>;

/**
 * A real `zod/mini` schema.
 *
 * `zod/mini` has no `_output` member, so it exercises the `_zod.output`
 * branch of {@link InferSchemaOutput}. The import is real, so no structural
 * fixture is needed for that branch.
 */
const miniSchema = zmini.object({
  firstName: zmini.string(),
  orders: zmini.array(zmini.object({ id: zmini.string() })),
});

/** The data shape of {@link miniSchema}, as zod itself reports it. */
type MiniOutput = zmini.infer<typeof miniSchema>;

/**
 * Any Standard Schema library exposes `"~standard".types.output`.
 *
 * This one stays a structural fixture. The branch must cover libraries such
 * as valibot and arktype, and this package installs none of them.
 */
interface StandardLike<O> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly types?: { readonly input: O; readonly output: O } | undefined;
  };
}

/** The sample shape a consumer would describe with a schema. */
interface Contact {
  firstName: string;
  orders: { id: string }[];
}

/** A real zod schema resolves to the exact type that `z.infer` reports. */
type FromRealZod = Expect<
  Equal<InferSchemaOutput<typeof contactSchema>, ContactOutput>
>;

/** A real `zod/mini` schema resolves through the `_zod.output` branch. */
type FromRealZodMini = Expect<
  Equal<InferSchemaOutput<typeof miniSchema>, MiniOutput>
>;

/** The Standard Schema member path resolves. */
type FromStandard = Expect<
  Equal<InferSchemaOutput<StandardLike<Contact>>, Contact>
>;

/** A plain object is not a schema. */
type PlainIsNotASchema = Expect<Equal<InferSchemaOutput<Contact>, never>>;

/** A real zod schema resolves to its output type. */
type DataOfRealZod = Expect<
  Equal<VariableDataOf<typeof contactSchema>, ContactOutput>
>;

/** A real `zod/mini` schema resolves to its output type. */
type DataOfRealZodMini = Expect<
  Equal<VariableDataOf<typeof miniSchema>, MiniOutput>
>;

/** A plain object type passes straight through. */
type DataOfPlain = Expect<Equal<VariableDataOf<Contact>, Contact>>;

/** The loose default passes straight through as well. */
type DataOfLoose = Expect<
  Equal<VariableDataOf<Record<string, any>>, Record<string, any>>
>;

/**
 * An optional zod field keeps its `undefined`, and a zod default does not.
 *
 * The assertion states the data shape member by member, so a change in the
 * zod output rules becomes a compile error here.
 */
type RealZodMembers = Expect<
  Equal<
    VariableDataOf<typeof contactSchema>,
    {
      firstName: string;
      age: number;
      nickname?: string | undefined;
      locale: string;
      address: { city: string; zip: string };
      orders: { id: string; total: number }[];
    }
  >
>;

/** The paths of a schema backed shape match the paths of its output. */
type PathsThroughSchema = Expect<
  Equal<
    VariablePath<VariableDataOf<typeof contactSchema>>,
    | "firstName"
    | "age"
    | "nickname"
    | "locale"
    | "address"
    | "address.city"
    | "address.zip"
    | "orders"
  >
>;

/** The loop sources of a schema backed shape are its array paths. */
type LoopsThroughSchema = Expect<
  Equal<ArrayVariablePath<VariableDataOf<typeof contactSchema>>, "orders">
>;

/** The item shape inside a loop over a schema backed array. */
type LoopItemThroughSchema = Expect<
  Equal<
    LoopItem<VariableDataOf<typeof contactSchema>, "orders">,
    { id: string; total: number }
  >
>;

/* Keep every assertion referenced, so no rule can prune them. */
export type VariableDataTypeTests = [
  FlatPaths,
  NestedPaths,
  ArrayIsTerminal,
  TupleIsTerminal,
  ReadonlyArrayIsTerminal,
  OptionalObjectExpands,
  NullableObjectExpands,
  LooseIsString,
  LooseIsNotNever,
  RecursiveTerminates,
  RecursiveDefaultTerminates,
  ZeroDepth,
  ExhaustedDepth,
  PrimitiveHasNoPaths,
  ArrayPaths,
  NestedArrayPaths,
  NoArrayPaths,
  OptionalArrayCounts,
  LooseArrayIsString,
  AtNested,
  AtRoot,
  AtThroughOptional,
  AtOptionalLeaf,
  AtMissing,
  ItemOfProducts,
  ItemOfReadonly,
  ItemOfNested,
  ItemOfOptional,
  ItemOfNonArray,
  FromRealZod,
  FromRealZodMini,
  FromStandard,
  PlainIsNotASchema,
  DataOfRealZod,
  DataOfRealZodMini,
  DataOfPlain,
  DataOfLoose,
  RealZodMembers,
  PathsThroughSchema,
  LoopsThroughSchema,
  LoopItemThroughSchema,
];

/** Keep the real schema values referenced, so no rule can prune them. */
export const variableDataSchemaFixtures = [contactSchema, miniSchema];
