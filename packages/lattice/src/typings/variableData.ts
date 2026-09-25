/**
 * Type level helpers for the consumer's variable data shape.
 *
 * A consumer gives the editor a sample object, or a schema, that describes the
 * variables a template can read. These types turn that shape into the set of
 * dotted paths that the editor accepts, so a typo is a compile error, not an
 * empty render.
 *
 * The rules match the run time picker in
 * `src/extensions/utils/mergeTagScope.ts`. See `isExpandable` there: only a
 * plain object expands into child rows, so an array is terminal. A template
 * loops over an array and never indexes into it.
 *
 * The model covers JSON shaped data, because merge tag samples are JSON. A
 * class instance such as `Date` walks into its method names. Do not put one in
 * a variable data shape.
 */

/**
 * The recursion budget, as a decrement table.
 *
 * `Prev[3]` is `2`, and `Prev[0]` is `never`. Each recursive step uses one
 * unit. The step at `never` stops the walk, so the compiler cannot loop
 * forever on a self referential shape.
 *
 * The budget counts the steps BELOW the root keys. A budget of 0 gives the
 * root keys only. The default budget of 5 gives paths of up to 6 segments.
 */
type Prev = [never, 0, 1, 2, 3, 4, 5];

/**
 * Every dotted path into `T`.
 *
 * An array is TERMINAL. The key of an array property is a path, but nothing
 * below it is. `VariablePath<{ products: { name: string }[] }>` is `"products"`
 * and never `"products.0.name"`.
 *
 * A tuple counts as an array, so it is terminal too. A readonly array and a
 * readonly property behave the same as the mutable forms.
 *
 * An optional or nullable property still produces its key, because the walk
 * strips `null` and `undefined` before it looks at the value.
 *
 * `VariablePath<Record<string, any>>` is `string`, not `never`. That is the
 * default shape when a consumer passes nothing, so it must stay loose and
 * accept any path.
 *
 * @typeParam T - The variable data shape.
 * @typeParam D - The remaining depth. See {@link Prev}. The default is 5.
 */
export type VariablePath<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends readonly unknown[]
    ? never
    : T extends object
      ? {
          [K in keyof T & string]:
            | K
            | (NonNullable<T[K]> extends readonly unknown[]
                ? never
                : NonNullable<T[K]> extends object
                  ? `${K}.${VariablePath<NonNullable<T[K]>, Prev[D]>}`
                  : never);
        }[keyof T & string]
      : never;

/**
 * Every dotted path into `T` that resolves to an array.
 *
 * These paths are the valid loop sources. The walk descends through plain
 * objects but not through an array, so a nested array such as `"user.orders"`
 * appears.
 *
 * `ArrayVariablePath<Record<string, any>>` is `string`, for the same reason as
 * {@link VariablePath}.
 *
 * @typeParam T - The variable data shape.
 * @typeParam D - The remaining depth. See {@link Prev}. The default is 5.
 */
export type ArrayVariablePath<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends readonly unknown[]
    ? never
    : T extends object
      ? {
          [K in keyof T & string]: NonNullable<T[K]> extends readonly unknown[]
            ? K
            : NonNullable<T[K]> extends object
              ? `${K}.${ArrayVariablePath<NonNullable<T[K]>, Prev[D]>}`
              : never;
        }[keyof T & string]
      : never;

/**
 * The type at a dotted path in `T`.
 *
 * The walk strips `null` and `undefined` from each container before it reads
 * the next segment. So `"user.email"` resolves on `{ user?: { email: string } }`.
 * It keeps `undefined` on the final value, so an optional leaf stays optional.
 *
 * A path that does not exist resolves to `never`.
 *
 * @typeParam T - The variable data shape.
 * @typeParam P - The dotted path, such as `"user.email"`.
 */
export type VariableAt<
  T,
  P extends string,
> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof NonNullable<T>
    ? VariableAt<NonNullable<T>[Head], Rest>
    : never
  : P extends keyof NonNullable<T>
    ? NonNullable<T>[P]
    : never;

/**
 * The element type at an array path. This is the item shape inside a loop.
 *
 * The path must resolve to an array, that is a path from
 * {@link ArrayVariablePath}. Any other path gives `never`.
 *
 * @typeParam T - The variable data shape.
 * @typeParam P - The dotted path to the array, such as `"products"`.
 */
export type LoopItem<T, P extends string> =
  NonNullable<VariableAt<T, P>> extends readonly (infer E)[] ? E : never;

/**
 * The output type of a zod like schema, read structurally.
 *
 * The editor must not import zod, because a consumer can use the editor with no
 * zod installed. These member paths come from the real declaration files:
 *
 * - `_output` — zod 3 `ZodType`, and zod 4 classic `ZodType`, which keeps
 *   `_output` as a deprecated alias of `_zod["output"]`.
 * - `_zod.output` — zod 4 core and zod 4 mini, which have no `_output`.
 * - `"~standard".types.output` — the Standard Schema contract. This covers any
 *   other compliant library, such as valibot or arktype.
 *
 * The result is `never` when `S` is not a schema.
 *
 * @typeParam S - A schema, or anything else.
 */
export type InferSchemaOutput<S> = S extends { _output: infer O }
  ? O
  : S extends { _zod: { output: infer O } }
    ? O
    : S extends { "~standard": { types?: { output: infer O } } }
      ? O
      : never;

/**
 * The variable data type, from either a plain sample object or a schema.
 *
 * A consumer writes `variableData={mySample}` or `variableData={mySchema}`.
 * This gives the schema output when `S` is a schema, and `S` otherwise.
 *
 * @typeParam S - The value the consumer passes as `variableData`.
 */
export type VariableDataOf<S> = [InferSchemaOutput<S>] extends [never]
  ? S
  : InferSchemaOutput<S>;
