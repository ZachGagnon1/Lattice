# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Lattice** — a React 19 email editor component library (a modernized fork of easy-email-editor). It uses MJML (Markup Language for Email) as its template standard, rendering email templates as a JSON block tree that can be exported to MJML or HTML.

## Commands

**Package manager: pnpm with workspaces (Lerna)**

```bash
# Install all workspace dependencies
pnpm run install-all

# Development
pnpm run dev                        # Start demo app dev server
cd packages/lattice && pnpm run dev # Start library dev server

# Build
pnpm run build:editor               # Build the lattice library
cd demo && pnpm run build           # Build demo app

# Code quality
pnpm run lint                       # Lint all workspaces
pnpm run format                     # Run prettier
pnpm run format:fix                 # Fix prettier issues
```

There is no test suite — CI only validates format and build.

## Monorepo Structure

```
packages/lattice/   — The published library (lattice-editor on npm)
demo/               — Demo application (deployed to GitHub Pages)
```

The library entry point is `packages/lattice/src/index.tsx`. It builds to `packages/lattice/lib/index.js` (ESM) via Vite.

## Architecture

### Block System

Everything in the editor is a **block** — a recursive JSON tree node:

```ts
IBlockData<Attr, Data> = {
  type: string              // e.g. BasicType.IMAGE, AdvancedType.TEXT
  data: { value, hidden }   // Block-specific content
  attributes: Attr          // MJML/HTML attributes (colors, sizing, etc.)
  children: IBlockData[]    // Nested child blocks
}
```

Block types live in two namespaces:

- `BasicType` — standard MJML blocks (page, section, column, text, image, button, etc.)
- `AdvancedType` — enhanced blocks with extra features (advanced_text, advanced_image, etc.)

Each block has an `IBlock<T>` definition with `create()` (factory), `validParentType[]`, and `render()`. Standard blocks are in `packages/lattice/src/core/blocks/standard/`, advanced blocks in `core/blocks/advanced/`.

### Data Flow

```
IEmailTemplate (JSON) → JsonToMjml → MJML string → mjml-browser → HTML
```

- **Testing mode** (`mode: 'testing'`): Adds CSS class names for interactive editor prompts
- **Production mode** (`mode: 'production'`): Clean HTML output

### State Management

The editor uses **react-hook-form** for the form state. The fields are `subject`, `subTitle`, and `content`. The `content` field holds the root `IPage` block. The `EmailEditorProvider` calls `useForm` and wraps the tree in `FormProvider`. A new `data` prop goes through `reset()`. The `EditorFormProvider` (`components/Provider/EditorFormProvider`) holds the only `useWatch` subscription for the whole form.

- react-hook-form sends a new deep clone of the values on each change. The `replaceEqualDeep` function in `utils/formValues.ts` keeps the identity of each unchanged block. The memoized components compare the blocks by identity.
- The `useEditorContext()` function returns `formState.values` and `formHelpers`. The `formHelpers` object has `change(path, value)`, `getValues()`, and `reset(values?)`.
- The editor paths use the lodash style, for example `content.children.[0]`. react-hook-form compares the names as strings. The `toFieldPath()` function turns each path into `content.children.0`. The `change`, `enhancer`, and `useEditorField` functions call it.
- An attribute field comes from the `enhancer` function, which binds with `useController`. The `config` prop takes a `FieldAdapter` with `format` and `parse`.
- The `useEditorField(path, adapter?)` function binds one value in the custom panel code. It returns `{ input }` with `value`, `onChange`, and `onBlur`. The `onChange` function takes a value or a MUI change event.

A sub-form, such as the rule builder or the padding group, has its own `useForm` and `FormProvider`. A field inside it binds to that sub-form, not to the root form.

Multiple React contexts are composed in `EmailEditorProvider`:

- `PropsProvider` — editor config (fonts, merge tags, upload handler)
- `RecordProvider` — undo/redo history
- `HoverIdxProvider` / `FocusBlockLayoutProvider` — selection state
- `PreviewEmailProvider`, `ScrollProvider`, `BlocksProvider`, `LanguageProvider`

### UI Extensions

The `StandardLayout` composes pluggable extension panels:

- `AttributePanel` — property editor for the selected block
- `BlockLayer` — block tree navigator
- `SourceCodePanel` — MJML/JSON editor (CodeMirror 6)
- `ShortcutToolbar`, `InteractivePrompt`, `MergeTagBadgePrompt`

### Condition Block

`BasicType.CONDITION` is a transparent layout wrapper. It renders its children with Handlebars `{{#if}}/{{/if}}`. It produces no MJML of its own. The MJML compiler only sees the inner blocks after a template engine expands the Handlebars.

**How it works end-to-end:**

1. The user configures rules in the Attribute Panel (field comparisons, AND/OR logic).
2. On save, the compiler turns the rules tree into a Handlebars subexpression, e.g. `(and (eq firstName 'John') (gt age 18))`.
3. In **production mode** the block outputs:
   ```
   {{#if (and (eq firstName 'John') (gt age 18))}}
   <mj-section>...</mj-section>
   {{/if}}
   ```
4. In **editor/testing mode** it renders a visible orange-bordered region with a human-readable label (`firstName equals "John" AND age > 18`). The author sees which condition applies.

**Valid children:** A Condition block holds exactly two `BasicType.CONDITION_BRANCH` blocks: the "if" branch, then the "else" branch. Each branch holds Section blocks only. A new Condition block starts with one Section that holds one Column in each branch. The branch block never appears in the block palette.

**Else branch:** In production the block outputs `{{#if expr}} …if… {{else}} …else… {{/if}}`. The `{{else}}` goes out only when a Column in the "else" branch holds a block. A Section with only empty Columns does not count, because it renders as blank space. With no rule set, only the "if" branch renders. In the editor, each branch renders a label strip that carries its editor classes, because a branch cannot be an `mj-wrapper` inside the Condition's `mj-wrapper`. The strip is the drop target of an empty branch.

**Valid parent:** A Condition block goes only at page level. In the editor it renders an `mj-wrapper`, and MJML does not allow an `mj-wrapper` inside an `mj-wrapper`. The For Loop block follows the same rules. `logicBlocks.mjml.test.ts` compiles both blocks with real MJML and fails on an invalid parent.

**Value quotes:** The compiler does not always quote a value. The `eq` helper compares with `===`, so `(eq age '18')` is false against numeric data. A canonical number goes out bare: `(gt age 18)`. A value that is not a canonical number stays quoted. This keeps a zip code such as `01234` and a price such as `1.50` as strings. The keywords `true`, `false`, `null`, and `undefined` also go out bare. `packages/lattice/src/core/utils/handlebars/literals.ts` holds this logic.

**The `lattice-editor/handlebars` entry point:**

This entry does the setup for you. `handlebars` is an optional peer
dependency, and the entry loads it with a dynamic `import()`. The main entry
never imports it.

```ts
import { renderToHtml, renderMjml } from "lattice-editor/handlebars";

const html = await renderToHtml(template, contactData);
```

The entry registers the seven helpers on an isolated `Handlebars.create()`
environment, so your global Handlebars stays clean. It also exports
`LOGIC_HELPERS`. When `handlebars` is not installed, the first call throws an
error that tells you to install it. `src/handlebars.ts` holds this code, and
`vite.config.ts` builds it as a second entry.

**Setting up Handlebars on the consumer side by hand:**

The main entry has no dependency on `handlebars`. Install the engine in your own
app:

```bash
npm install handlebars
```

The compiler emits exactly seven helpers: `eq`, `gt`, `lt`, `not`, `contains`,
`and`, and `or`. Register them by hand. Each one is a single line.

```ts
// The helpers the Lattice compiler emits. Register them by hand on purpose:
// handlebars-helpers is CommonJS and calls require() at module scope, which
// throws "require is not defined" in a browser bundle.
const LOGIC_HELPERS = {
  eq: (a: unknown, b: unknown) => a === b,
  gt: (a: any, b: any) => a > b,
  lt: (a: any, b: any) => a < b,
  not: (v: unknown) => !v,
  contains: (haystack: unknown, needle: any) =>
    Array.isArray(haystack) || typeof haystack === "string"
      ? (haystack as any).includes(needle)
      : false,
  and: (...args: unknown[]) => {
    args.pop();
    return args.every(Boolean);
  },
  or: (...args: unknown[]) => {
    args.pop();
    return args.some(Boolean);
  },
};

Handlebars.registerHelper(LOGIC_HELPERS);
```

Register the helpers once, at module scope. A call on every render repeats the
same work.

`and` and `or` take any number of arguments. Handlebars appends an `options`
object as the last argument, so each one removes that argument first.

**Do not use `handlebars-helpers` in a browser bundle.** The package is
CommonJS, and its `lazy-cache` dependency calls a bare `require()` at module
scope. A browser has no `require`, so the module throws
`ReferenceError: require is not defined` when the page loads. A narrow import
of `handlebars-helpers/lib/comparison` does not help, because that file still
pulls in `lib/utils/utils.js`. The package works on a Node backend, where
`require` exists.

**There is no `ne` helper.** `Not Equals` compiles to `(not (eq a b))`, which
is the exact negation of `Equals`. The two operators therefore always agree.

**Operator → helper mapping:**

The table matches `OPERATOR_HELPER_NAMES` in `packages/lattice/src/core/utils/handlebars/types.ts`.

| Rule operator | Helper used                           |
| ------------- | ------------------------------------- |
| Equals        | `eq`                                  |
| Not Equals    | `not` + `eq` — emits `(not (eq a b))` |
| Greater Than  | `gt`                                  |
| Less Than     | `lt`                                  |
| Contains      | `contains`                            |
| Is Empty      | `not`                                 |
| Is Not Empty  | (truthy — no helper needed)           |
| AND group     | `and`                                 |
| OR group      | `or`                                  |

### Template Engine Seams

The editor gives you two places to run a template engine. Both are optional.

**`onBeforeMjmlCompile` — the preview seam.**

This prop on `LatticeEditor` runs between `JsonToMjml()` and `mjml()`. Prefer it for `{{#each}}`. The engine expands the loop first, so MJML computes the column widths on the final markup. `onBeforePreview` runs after `mjml()`, so a loop over columns renders wrong there.

The second argument is the preview data. It is the `variableData` prop. The `previewOverride` prop merges over it.

```tsx
const handleBeforeMjmlCompile = useCallback(
  (mjmlString: string, data: Record<string, any>) => {
    try {
      return Handlebars.compile(mjmlString)(data);
    } catch (error) {
      console.error(error);
      return mjmlString; // Keep the preview alive on a half-typed rule.
    }
  },
  [],
);

<LatticeEditor
  data={template}
  previewOverride={PREVIEW_DATA}
  onBeforeMjmlCompile={handleBeforeMjmlCompile}
/>;
```

Memoise the callback. `PreviewEmailProvider` lists `onBeforeMjmlCompile` in the dependency array of its preview effect. An inline arrow rebuilds the preview on every render.

Give `variableData` real sample values. One object does both jobs.

The picker reads the KEYS to build its tree, and it wraps a picked path with
`mergeTagGenerate`. A value never has to be a `"{{firstName}}"` placeholder.
Real values work, and they also let the preview render. Put two or three
entries in each array, so a loop visibly repeats.

Set `previewOverride` only when the preview needs different data from the
picker sample. The editor merges it over `variableData`. It replaces only the
keys that it names.

### The `variableData` Prop

`variableData` accepts a plain sample object, or a zod schema. `LatticeEditor`
normalises the value at its boundary, so nothing inside the editor ever sees a
schema.

**The library has no zod dependency.** zod is not a dependency, not a peer
dependency, and not a type-only import. A type-only import still has to
resolve at build time, so a consumer without zod would fail to build. The
editor duck-types the public zod surface instead:

- an object schema exposes `shape`, a record of child schemas;
- an array schema exposes `element`, the item schema;
- a wrapper schema exposes `unwrap()`, `removeDefault()`, or `removeCatch()`.

These members are public API in zod 3 and zod 4.
`packages/lattice/src/utils/variableSchema.ts` holds this logic. zod is a
devDependency of `packages/lattice`, and only the type tests use it.

**A schema carries no values.** The editor therefore generates placeholder
data from the schema, and every placeholder is ALWAYS A STRING. The public zod
API does not report the primitive type of a leaf, so the editor cannot tell a
number from a string. Each leaf becomes its own field name, such as
`"firstName"`.

The consequence: a numeric Condition previews against a string. `(gt age 18)`
compares the string `"age"` with the number `18`. Pass `previewOverride` with
real values for the fields that need them. The plain object form has this
problem nowhere, because it already holds real values.

**Three usage modes.**

1. Pass nothing. The paths widen to `string`, and the picker is empty.

   ```tsx
   <LatticeEditor data={template} />
   ```

2. Pass a plain object. TypeScript infers the shape from the literal. You
   write no type argument.

   ```tsx
   <LatticeEditor data={template} variableData={{ firstName: "John" }} />
   ```

3. Pass an explicit type argument. The paths are typed, but the picker is
   empty at run time, because TypeScript erases a type.

   ```tsx
   <LatticeEditor<Contact> data={template} />
   ```

A schema works like mode 2. The type flows through `VariableDataOf`.

```tsx
<LatticeEditor
  data={template}
  variableData={contactSchema}
  previewOverride={{ age: 34 }}
/>
```

`previewOverride` is `Partial<VariableDataOf<TVar>>`, so it speaks in terms of
the DATA in every mode. A key that the shape does not hold is a compile error.

**The generic stops at the boundary.** React context cannot be generic per
consumer, so `PropsProvider` keeps a plain
`variableData?: Record<string, any>`, which holds the resolved sample.

`packages/lattice/src/typings/variableData.ts` holds the path types:
`VariablePath`, `ArrayVariablePath`, `VariableAt`, `LoopItem`,
`InferSchemaOutput`, and `VariableDataOf`.

**`exportToHtml(template, { transformMjml })` — the export seam.**

`transformMjml` runs on the MJML string before `mjml()` compiles it. It accepts a string or a promise.

```ts
const html = await exportToHtml(template, {
  transformMjml: (mjmlString) => Handlebars.compile(mjmlString)(contactData),
});
```

`exportToMjml(template)` returns the raw MJML with the Handlebars intact. Send that to a backend when the backend renders the data.

### Key Implementation Details

- **200ms debounce** on `onChange` in `LatticeEditor` to prevent excessive re-renders
- Image blocks are auto-stripped when no `onUploadImage` handler is provided
- **Custom blocks** are created via `createCustomBlock()` and registered in the block map
- **Unlayer template** import is available via `unlayerToLattice()`
- **Table row loop**: the Table block takes a `rowLoop` config (`source`, `itemAs`, `headerRows`). `headerRows` is the count of leading rows that stay out of the `{{#each}}`. Set it to `1` to keep a header row static.
- SCSS modules use `localsConvention: "dashes"`
- MUI v9 + Base UI v1.4.1 for component styling; Emotion for CSS-in-JS
