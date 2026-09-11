# Logic blocks: why their children are inert

Status: diagnosed, not fixed. Written 2026-09-11.

## The report

Blocks dropped inside a Condition or a ForLoop appear, but you cannot select them, you
cannot type in them, you cannot add more, and they lose the page styles.

## The short answer

There are **two** independent defects. Both come from one decision: Condition and ForLoop
render their editor marker as `<mj-raw>` and then emit their children **as siblings of that
marker**, inside whatever MJML parent the logic block happens to sit in.

**Production output is safe.** In production the markers are bare _text_ nodes (`{{#if}}`),
which sit harmlessly inside `<tbody>` and disappear when Handlebars runs. Only the
`mode === "testing"` branch is broken. The export-then-render-on-a-backend flow is
unaffected.

## Evidence

Every row below was compiled with the repo's own `mjml-browser`, then parsed with the same
HTML5 parser the editor uses.

| Condition's MJML parent                 | MJML errors | Children keep their classes | Selectable and typeable | Layout                            |
| --------------------------------------- | ----------- | --------------------------- | ----------------------- | --------------------------------- |
| `mj-column`                             | none        | **yes**, on the `<td>`      | **yes**                 | markers ejected above the content |
| `mj-body` (under Page)                  | **3**       | **no**                      | **no**                  | column and 600px chrome gone      |
| `mj-section`                            | **3**       | **no**                      | **no**                  | same                              |
| `mj-wrapper`                            | **3**       | **no**                      | **no**                  | same                              |
| Section inside Condition inside Wrapper | none        | yes                         | yes                     | fine                              |

### Root cause 1 — content outside a column loses its identity

This is the defect that produces the reported symptoms.

`Condition.validParentType` includes `PAGE`, `WRAPPER` and `SECTION`. `Text`, `Image`,
`Button`, `Divider` and `Spacer` all list `CONDITION` and `FOR_LOOP` in their own
`validParentType`. So the editor lets you put a Condition at page level and drop a Text
into it. The Text is then emitted outside any `mj-column`.

**MJML silently drops `css-class` on a content component that is not inside an
`mj-column`.** The class is normally written onto the `<td>` that `mj-column` generates. No
column, no `<td>`, no class. MJML reports this as a soft validation error, and
`MjmlDomRender` swallows soft errors, so nothing surfaces.

Everything in the editor keys off that class:

- **Selection** — `getBlockNodeByChildEle` walks up to the nearest `.email-block`. With no
  class on the text, that is the page. You select the page instead of the text.
- **Typing** — `HtmlStringToReactNodes` only makes a node editable when it carries both
  `node-type-*` and `node-idx-*`. No class, never editable.
- **Adding more** — drag-over resolves the same way, so the drop lands on the page.
- **Styles** — the whole `<tr><td align padding>`, the `.mj-column-per-100` wrapper, and the
  600px centred table all vanish. The content goes full-bleed.

### Root cause 2 — the marker breaks the table, and is too small to drop into

Even in the column case, which mostly works:

- `mj-column` renders children into a `<table>`, but passes `mj-raw` through untouched. So
  the marker `<div>` becomes a direct child of `<tbody>`. The HTML5 parser **foster-parents**
  it out, above the table. The `/IF` marker therefore renders **above** the content it
  closes.
- The closing marker carries **no classes at all**, so pointing at it resolves to the
  grandparent.
- A non-empty logic block's only hit region is a ~20px label strip. `getDirectionPosition`
  uses a 10px edge deviation, so on a 20px element `isEdge` is **always** true. That triggers
  the escape-to-grandparent branch in `getInsertPosition`, and the drop inserts a _sibling_
  of the Condition. That is the literal "cannot add more" mechanism.

### The underlying invariant

`BasicBlock` gives every working container exactly two things:

1. a real MJML tag whose compiled element carries `email-block node-idx-* node-type-*`, and
2. children emitted **between** its opening and closing tag, so the parent element is a true
   DOM ancestor of its children.

Condition and ForLoop use `BlockRenderer` directly, on purpose, to avoid emitting a wrapper
tag. They get neither. Every editor subsystem assumes both.

Side note: `getPlaceholder.tsx` has a branch for `CONDITION` and `FOR_LOOP`, but
`getPlaceholder` is only called from `BasicBlock`, which these blocks never use. It is dead
code, and the two blocks hand-roll their own placeholder instead.

## Options

### Option A — make them real wrapper-level containers

Restrict Condition and ForLoop to section level, and render them through `BasicBlock`.

- `validParentType` becomes `[PAGE, WRAPPER]`.
- Valid children become `[SECTION]` only. Remove `CONDITION` and `FOR_LOOP` from the
  `validParentType` of every content block.
- Testing mode renders `<BasicBlock tag="mj-wrapper">`, which is a legal parent of
  `mj-section`. Real element, real classes, children nested, placeholder for free.
- Production stays transparent: raw `{{#if}}`, children, raw `{{/if}}`.

Fixes every symptom, and reuses machinery that already works.

Cost: to gate a single Text you must wrap it in a Section. That is a real UX regression from
what `CLAUDE.md` currently promises.

### Option B — make the condition a property, not a block (recommended)

Give every block an optional `data.value.condition` and `data.value.repeat`. A block wraps
its **own** output in `{{#if}}` or `{{#each}}`.

- Production emits raw text directives around the block's own tag. Safe, as established.
- Testing mode adds **no DOM at all**. Show the condition as a badge through the existing
  overlay, or as an outline via a class on the block's own element.
- Nothing about the block tree changes, so selection, typing, and drops keep working at
  every level, including inside a column.
- There is already a working precedent in this codebase: the Table block's `rowLoop`.

To gate several blocks at once, put them in a Section or Column and set the condition on
that. This matches how MJML is structured anyway.

Cost: a bigger change. The rule builder UI moves into a shared attribute panel section, and
existing templates that use Condition blocks need a migration.

### Option C — both

Option B for per-block conditions, plus Option A's wrapper-level Condition block kept purely
as a multi-section grouping container.

Most capable, most surface area.

## Recommendation

**Option B.** It removes the container problem rather than working around it, it is the only
option that works inside a column, and the Table `rowLoop` already proves the pattern in this
codebase. Option A is a reasonable smaller step if the block metaphor matters.

## Interim mitigation, if a fast partial fix is wanted

This does not need the full redesign, and it converts the bug from "completely broken" to
"works, with a cosmetic flaw":

1. Remove `PAGE`, `WRAPPER` and `SECTION` from `Condition.validParentType` and
   `ForLoop.validParentType`, leaving `COLUMN` (and `HERO`). This makes the only reachable
   case the one where children keep their classes.
2. Put the block's idx classes on the closing marker too.
3. Give the non-empty marker enough height that `getDirectionPosition` leaves a non-edge
   middle band, so a drop resolves into the block rather than escaping to its parent.
4. Stop `MjmlDomRender` swallowing soft MJML validation errors — surface them in development.
   None of this would have reached a user if those three errors had been visible.

Remaining after the mitigation: the marker still foster-parents above the content, so `/IF`
reads out of order.

## Verification for whichever option is chosen

- Compile Page → Wrapper → Section → Column → Condition → [Text, Text, Image] and assert the
  MJML error list is empty.
- Assert every child element in the compiled HTML carries `email-block node-idx-* node-type-*`.
- Assert the Condition's own element **contains** its children's elements, rather than
  preceding them.
- Assert production output places `{{#if}}` before, and `{{/if}}` after, the gated content.
- By hand: select a child, type in it, drag a fourth block in between two existing children,
  and confirm the page styles and 600px width still apply.

## Files

- `packages/lattice/src/core/blocks/standard/Condition/index.tsx` — markers, `validParentType`
- `packages/lattice/src/core/blocks/standard/ForLoop/index.tsx` — same
- `packages/lattice/src/core/components/BasicBlock.tsx` — what a working container does
- `packages/lattice/src/core/components/BlockRenderer.tsx` — the dispatcher these blocks use
- `packages/lattice/src/core/utils/getAdapterAttributesString.ts` — where `css-class` is set
- `packages/lattice/src/utils/HtmlStringToReactNodes.tsx` — contenteditable gating
- `packages/lattice/src/hooks/useDropBlock.ts` — click, hover and drag resolution
- `packages/lattice/src/utils/getInsertPosition.ts` — the escape-to-grandparent branch
- `packages/lattice/src/components/.../MjmlDomRender.tsx` — swallows MJML validation errors
- `packages/lattice/src/core/blocks/standard/Text/index.tsx` and `Image/index.tsx` —
  `validParentType` entries that permit the broken trees
