import { get, isPlainObject } from "lodash";

import { BasicType } from "@/core/constants";
import { getParentIdx } from "@/core/utils/block";

/**
 * NOTE: no path can address a merge tag key that contains a literal `.`, such
 * as `{ "a.b": 1 }`. Each path here goes through lodash `get`, which reads a
 * `.` as a path separator. The limit is older than this module, and this
 * module does not fix it.
 */

/**
 * One `{{#each}}` loop that is active at a given block position.
 *
 * A scope is registered even when its source does not resolve, because the
 * alias is still real at run time. Use {@link LoopScope.resolved} to tell the
 * two cases apart.
 */
export interface LoopScope {
  /** The idx of the block that declares the loop. */
  idx: string;
  /** The source path exactly as the author wrote it, such as `product.variants`. */
  source: string;
  /** The alias the author wrote. An empty string when the author left it blank. */
  itemAs: string;
  /** The path segment we emit for the loop item. This is `itemAs` or `"this"`. */
  prefix: string;
  /**
   * The sample for one ITEM of the array, that is element 0. It is
   * `undefined` when the source does not resolve.
   */
  sample: any;
  /** `true` only when the source resolves to a non-empty array. */
  resolved: boolean;
}

/**
 * The kind of a root entry in the merge tag picker.
 *
 * - `loop-field` — a bare field of the innermost loop item.
 * - `loop-group` — a folder for an outer loop item.
 * - `loop-item` — the whole loop item, used when the item is not a plain object.
 * - `global` — a top level merge tag.
 */
export type ScopedMergeTagKind =
  | "loop-field"
  | "loop-group"
  | "loop-item"
  | "global";

/**
 * One row that the merge tag picker shows at the root level.
 *
 * `displayPath` and `emitPath` are different on purpose. The tree shows a loop
 * field bare, such as `name`, but must insert the alias qualified path, such as
 * `product.name`.
 */
export interface ScopedMergeTagEntry {
  /** The label the tree shows, such as `name`. */
  displayPath: string;
  /** The path the editor inserts, such as `product.name`. */
  emitPath: string;
  /** The sample value. The picker uses it to decide leaf, array, or object. */
  value: any;
  kind: ScopedMergeTagKind;
  /** The loop that owns this entry. It is absent for a global. */
  scope?: LoopScope;
}

/**
 * The full merge tag view for one block position.
 */
export interface ScopedMergeTags {
  /** The root rows, already in the order the picker must show them. */
  roots: ScopedMergeTagEntry[];
  /** The active loops, innermost first, after the shadow filter. */
  scopes: LoopScope[];
  /** A flat map of every name that resolves at this position. */
  tags: Record<string, any>;
}

/**
 * Options for {@link getLoopScopes} and {@link getScopedMergeTags}.
 */
export interface ScopeOptions {
  /** Include the loop that the block at `idx` declares. Default false. */
  includeSelfLoop?: boolean;
}

/**
 * Tell the picker whether it can expand a sample value into child rows.
 *
 * Only plain objects expand. Arrays are terminal, because `{{products.0.name}}`
 * is never a valid path for a template. Both this module and the picker must
 * use this helper so that they agree.
 *
 * @param value - A sample value.
 * @returns `true` when the picker can show children for the value.
 */
export const isExpandable = (value: unknown): boolean => isPlainObject(value);

/** A loop declaration from a block, before the source is resolved. */
interface LoopDeclaration {
  idx: string;
  source: string;
  itemAs: string;
}

/** Read a string field and trim it. Return an empty string for anything else. */
function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Read the loop declaration from one block.
 *
 * A Table declares its loop through `rowLoop`. That loop wraps the Table's own
 * rows and `Table.children` is always empty, so it must never reach a
 * descendant. The `isSelf` flag enforces that structurally: the caller passes
 * `true` only for the block at `idx`.
 */
function readLoopDeclaration(
  block: unknown,
  idx: string,
  isSelf: boolean,
): LoopDeclaration | undefined {
  if (!block || typeof block !== "object") return undefined;

  const value = (block as { data?: { value?: unknown } }).data?.value;
  if (!value || typeof value !== "object") return undefined;

  const type = (block as { type?: unknown }).type;

  if (type === BasicType.FOR_LOOP) {
    const source = readString((value as { dataSource?: unknown }).dataSource);
    if (!source) return undefined;
    return {
      idx,
      source,
      itemAs: readString((value as { itemAs?: unknown }).itemAs),
    };
  }

  if (type === BasicType.TABLE && isSelf) {
    const rowLoop = (value as { rowLoop?: unknown }).rowLoop;
    if (!rowLoop || typeof rowLoop !== "object") return undefined;
    const source = readString((rowLoop as { source?: unknown }).source);
    if (!source) return undefined;
    return {
      idx,
      source,
      itemAs: readString((rowLoop as { itemAs?: unknown }).itemAs),
    };
  }

  return undefined;
}

/**
 * Collect the idx chain for `idx`, outermost first.
 *
 * The walk uses `getParentIdx`, which returns `undefined` at the page root.
 */
function collectChain(idx: string, includeSelf: boolean): string[] {
  const chain: string[] = [];
  let cursor: string | undefined = includeSelf ? idx : getParentIdx(idx);
  while (cursor) {
    chain.push(cursor);
    cursor = getParentIdx(cursor);
  }
  return chain.reverse();
}

/**
 * Resolve one loop source against the scopes already resolved outside it.
 *
 * The head segment can name an outer alias, so `product.variants` resolves once
 * `product` is in scope. The head `this` names the innermost scope.
 */
function resolveSource(
  source: string,
  outerScopes: LoopScope[],
  variableData: Record<string, any>,
): unknown {
  const segments = source.split(".");
  const head = segments[0];
  const rest = segments.slice(1).join(".");

  for (let i = outerScopes.length - 1; i >= 0; i -= 1) {
    const scope = outerScopes[i];
    if (scope.prefix === head) {
      return rest ? get(scope.sample, rest) : scope.sample;
    }
  }

  if (head === "this") {
    const innermost = outerScopes[outerScopes.length - 1];
    if (!innermost) return undefined;
    return rest ? get(innermost.sample, rest) : innermost.sample;
  }

  return get(variableData, source);
}

/**
 * Drop every scope whose prefix a more inner scope already claims.
 *
 * A blank alias also becomes unreachable once another loop nests inside it, so
 * a non-innermost `this` is dropped too.
 *
 * @param scopes - The resolved scopes, outermost first.
 * @returns The surviving scopes, innermost first, with unique prefixes.
 */
function shadowFilter(scopes: LoopScope[]): LoopScope[] {
  const innermostFirst = [...scopes].reverse();
  const claimed = new Set<string>();
  const kept: LoopScope[] = [];

  innermostFirst.forEach((scope, position) => {
    if (claimed.has(scope.prefix)) return;
    if (position > 0 && scope.prefix === "this") return;
    claimed.add(scope.prefix);
    kept.push(scope);
  });

  return kept;
}

/**
 * Find every `{{#each}}` loop that is active at a block position.
 *
 * It resolves the sources outermost first so an inner source can name an
 * outer alias. It skips malformed block data. It never throws.
 *
 * @param variableData - The root variable data sample.
 * @param context - The form values, that is `{ content: <page block> }`.
 * @param idx - The idx of the block in focus.
 * @returns The active scopes, innermost first, with unique prefixes.
 */
export function getLoopScopes(
  variableData: Record<string, any>,
  context: { content: any },
  idx: string,
  options?: ScopeOptions,
): LoopScope[] {
  const safeTags = isPlainObject(variableData) ? variableData : {};
  if (!idx || !context) return [];

  const includeSelf = options?.includeSelfLoop === true;
  const chain = collectChain(idx, includeSelf);

  const declarations: LoopDeclaration[] = [];
  chain.forEach((someIdx) => {
    const block = get(context, someIdx);
    const declaration = readLoopDeclaration(block, someIdx, someIdx === idx);
    if (declaration) declarations.push(declaration);
  });

  const resolved: LoopScope[] = [];
  declarations.forEach((declaration) => {
    const container = resolveSource(declaration.source, resolved, safeTags);
    const usable = Array.isArray(container) && container.length > 0;
    resolved.push({
      idx: declaration.idx,
      source: declaration.source,
      itemAs: declaration.itemAs,
      prefix: declaration.itemAs || "this",
      sample: usable ? (container as any[])[0] : undefined,
      resolved: usable,
    });
  });

  return shadowFilter(resolved);
}

/**
 * Build the merge tag rows that the picker shows at a block position.
 *
 * The root order is a product requirement:
 * 1. the fields of the innermost loop item, flat and bare;
 * 2. one folder per outer loop, innermost first;
 * 3. the global merge tags, in declaration order.
 *
 * @param variableData - The root variable data sample.
 * @param context - The form values, that is `{ content: <page block> }`.
 * @param idx - The idx of the block in focus.
 * @param options - See {@link ScopeOptions}.
 * @returns The roots, the active scopes, and a flat map of resolvable names.
 */
export function getScopedMergeTags(
  variableData: Record<string, any>,
  context: { content: any },
  idx: string,
  options?: ScopeOptions,
): ScopedMergeTags {
  const safeTags = isPlainObject(variableData) ? variableData : {};
  const scopes = getLoopScopes(safeTags, context, idx, options);

  const roots: ScopedMergeTagEntry[] = [];
  const [innermost, ...outer] = scopes;

  if (innermost) {
    if (isPlainObject(innermost.sample)) {
      Object.keys(innermost.sample).forEach((key) => {
        roots.push({
          displayPath: key,
          emitPath: `${innermost.prefix}.${key}`,
          value: innermost.sample[key],
          kind: "loop-field",
          scope: innermost,
        });
      });
    } else {
      roots.push({
        displayPath: innermost.prefix,
        emitPath: innermost.prefix,
        value: innermost.sample,
        kind: "loop-item",
        scope: innermost,
      });
    }
  }

  outer.forEach((scope) => {
    roots.push({
      displayPath: scope.prefix,
      emitPath: scope.prefix,
      value: scope.sample,
      kind: "loop-group",
      scope,
    });
  });

  Object.keys(safeTags).forEach((key) => {
    roots.push({
      displayPath: key,
      emitPath: key,
      value: safeTags[key],
      kind: "global",
    });
  });

  const tags: Record<string, any> = {
    ...Object.fromEntries(
      scopes
        .filter((scope) => scope.sample !== undefined)
        .map((scope) => [scope.prefix, scope.sample]),
    ),
    ...safeTags,
  };

  return { roots, scopes, tags };
}
