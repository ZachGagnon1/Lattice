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

`BasicType.CONDITION` is a transparent layout wrapper that conditionally renders its children using Handlebars `{{#if}}/{{/if}}`. It produces no MJML of its own — the MJML compiler only sees the inner blocks after Handlebars preprocessing has run.

**How it works end-to-end:**

1. The user configures rules in the Attribute Panel (field comparisons, AND/OR logic).
2. On save, the rules tree is compiled into a Handlebars subexpression, e.g. `(and (eq firstName 'John') (gt age 18))`.
3. In **production mode** the block outputs:
   ```
   {{#if (and (eq firstName 'John') (gt age 18))}}
   <mj-section>...</mj-section>
   {{/if}}
   ```
4. In **editor/testing mode** it renders a visible orange-bordered region with a human-readable label (`firstName equals "John" AND age > 18`) so the author can see which condition applies.

**Valid children:** Section, Wrapper, Column, and all content blocks (Text, Image, Button, etc.) can be dropped directly into a Condition block. Advanced variants work too.

**Setting up Handlebars on the consumer side:**

The generated expressions use standard Handlebars subexpression syntax. Register comparison helpers before compiling:

```bash
npm install handlebars handlebars-helpers
```

```js
import Handlebars from 'handlebars';
import helpers from 'handlebars-helpers';

helpers({ handlebars: Handlebars }); // registers eq, ne, gt, lt, and, or, not, contains, etc.

// Preprocess the template, then pass to MJML
const mjmlString = Handlebars.compile(latticeTemplate)(contactData);
const { html } = mjml(mjmlString);
```

**Operator → helper mapping:**

| Rule operator | Helper used |
|---|---|
| Equals | `eq` |
| Not Equals | `ne` |
| Greater Than | `gt` |
| Less Than | `lt` |
| Contains | `contains` |
| Is Empty | `not` |
| Is Not Empty | (truthy — no helper needed) |
| AND group | `and` |
| OR group | `or` |

### Key Implementation Details

- **200ms debounce** on `onChange` in `LatticeEditor` to prevent excessive re-renders
- Image blocks are auto-stripped when no `onUploadImage` handler is provided
- **Custom blocks** are created via `createCustomBlock()` and registered in the block map
- **Unlayer template** import is available via `unlayerToLattice()`
- SCSS modules use `localsConvention: "dashes"`
- MUI v9 + Base UI v1.4.1 for component styling; Emotion for CSS-in-JS
