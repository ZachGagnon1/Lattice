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
packages/lattice/   — The published library (@4life-dev/lattice)
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

The editor uses **React Final Form** to manage the email template form state (fields: `subject`, `subTitle`, `content`). The content field holds the root `IPage` block.

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

**Valid children:** Section, Wrapper, Column, and all content blocks (Text, Image, Button, etc.) drop directly into a Condition block.

**Value quotes:** The compiler does not always quote a value. `handlebars-helpers` compares with `===`, so `(eq age '18')` is false against numeric data. A canonical number goes out bare: `(gt age 18)`. A value that is not a canonical number stays quoted. This keeps a zip code such as `01234` and a price such as `1.50` as strings. The keywords `true`, `false`, `null`, and `undefined` also go out bare. `packages/lattice/src/core/utils/handlebars/literals.ts` holds this logic.

**Setting up Handlebars on the consumer side:**

The library has no dependency on `handlebars`. Install the engine in your own app:

```bash
npm install handlebars handlebars-helpers
```

```js
import Handlebars from "handlebars";
import helpers from "handlebars-helpers";

helpers({ handlebars: Handlebars }); // registers eq, gt, lt, and, or, not, contains
```

The compiler emits only helpers that `handlebars-helpers` provides. Note that
`handlebars-helpers` has no `ne` helper, so Not Equals compiles to
`(not (eq a b))`. That is the exact negation of Equals. Its `isnt` helper exists,
but it compares with `!=` while `eq` compares with `===`, so the pair would not
agree.

In a browser bundle, import only the comparison group. The package root also loads groups that require the Node `fs`, `path`, and `url` modules:

```js
import comparisonHelpers from "handlebars-helpers/lib/comparison";
Handlebars.registerHelper(comparisonHelpers);
```

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

The second argument is the preview data. It is `previewInjectData` when you set that prop, and `mergeTags` when you do not.

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
  previewInjectData={PREVIEW_DATA}
  onBeforeMjmlCompile={handleBeforeMjmlCompile}
/>;
```

Memoise the callback. `PreviewEmailProvider` lists `onBeforeMjmlCompile` in the dependency array of its preview effect. An inline arrow rebuilds the preview on every render.

Give `mergeTags` real sample values. One object does both jobs.

The picker reads the KEYS to build its tree, and it wraps a picked path with
`mergeTagGenerate`. A value never has to be a `"{{firstName}}"` placeholder.
Real values work, and they also let the preview render. Put two or three
entries in each array, so a loop visibly repeats.

Set `previewInjectData` only when the preview needs different data from the
picker sample. The editor falls back to `mergeTags` when you omit it.

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
