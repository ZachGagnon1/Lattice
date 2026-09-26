/**
 * Compiles a loop configuration into Handlebars `{{#each}}` markup.
 *
 * The ForLoop block and the Table `rowLoop` use this module. Each caller
 * stores its path under a different key and adapts its data into an
 * `ILoopConfig` before the call.
 */

import { ConditionIssue, ILoopConfig } from "./types";
import { normalizeFieldPath } from "./literals";

export const LOOP_CLOSE = "{{/each}}";

/** A valid Handlebars block parameter name. */
const ALIAS_PATTERN = /^[A-Za-z_$][\w$]*$/;

/** Matches one `<tr>` element. The content holds only `<tr>` elements. */
const ROW_PATTERN = /<tr\b[\s\S]*?<\/tr>/gi;

/**
 * Reads the alias, and tells whether the stored text is usable.
 *
 * @returns The alias to emit (`""` when there is none) and its validity.
 */
function readAlias(cfg: ILoopConfig | undefined): {
  alias: string;
  invalid: boolean;
} {
  const raw = String(cfg?.itemAs ?? "").trim();

  if (raw === "") {
    return { alias: "", invalid: false };
  }

  if (!ALIAS_PATTERN.test(raw)) {
    // An alias that is not an identifier, such as `item name`, breaks the
    // block parameter list.
    // Drop the alias and run the loop on `this`.
    return { alias: "", invalid: true };
  }

  return { alias: raw, invalid: false };
}

/**
 * Builds the opening tag of a loop.
 *
 * @returns `{{#each items as |item|}}`, or `null` when the source is blank.
 */
export function compileLoopOpen(cfg: ILoopConfig | undefined): string | null {
  const source = normalizeFieldPath(cfg?.source ?? "");
  if (source === "") {
    return null;
  }

  const { alias } = readAlias(cfg);
  const suffix = alias === "" ? "" : ` as |${alias}|`;

  return `{{#each ${source}${suffix}}}`;
}

/**
 * Builds the editor label of a loop.
 *
 * @returns `FOR EACH: items as |item|`, or `(no data source set)`.
 */
export function compileLoopLabel(cfg: ILoopConfig | undefined): string {
  const source = normalizeFieldPath(cfg?.source ?? "");
  if (source === "") {
    return "(no data source set)";
  }

  const { alias } = readAlias(cfg);
  const suffix = alias === "" ? "" : ` as |${alias}|`;

  return `FOR EACH: ${source}${suffix}`;
}

/**
 * Lists the problems in a loop configuration.
 *
 * The codes come from the condition compiler. A blank source reuses
 * `MISSING_FIELD` and a bad alias reuses `MISSING_VALUE`. A loop has one
 * node, so it needs no new code.
 *
 * @returns The issues, in report order. The `path` is always `""`.
 */
export function compileLoopIssues(
  cfg: ILoopConfig | undefined,
): ConditionIssue[] {
  const issues: ConditionIssue[] = [];

  if (normalizeFieldPath(cfg?.source ?? "") === "") {
    issues.push({
      path: "",
      code: "MISSING_FIELD",
      message: "This loop has no data source. Pick an array field.",
    });
  }

  if (readAlias(cfg).invalid) {
    issues.push({
      path: "",
      code: "MISSING_VALUE",
      message:
        "The item name is not a valid identifier. Use letters, digits, and underscores.",
    });
  }

  return issues;
}

/**
 * Wraps the table body rows in a loop.
 *
 * A regular expression is safe here. The content holds only `<tr>`
 * elements. The editor does not add a nested table. The worst case
 * wraps every row in the loop. That result matches the old code.
 *
 * @param content - The HTML string of `<tr>` rows.
 * @returns The content with one loop around the body rows.
 */
export function wrapTableRowsInEach(
  content: string,
  cfg: ILoopConfig | undefined,
): string {
  const open = compileLoopOpen(cfg);
  if (open === null) {
    return content;
  }

  const rows = Array.from(String(content ?? "").matchAll(ROW_PATTERN));
  if (rows.length === 0) {
    return content;
  }

  const skip = Math.min(Math.max(cfg?.headerRows ?? 0, 0), rows.length);
  if (skip >= rows.length) {
    return content;
  }

  // Slice by match position. A re-join of the parsed rows drops the
  // `<thead>`, the `<tbody>`, and the whitespace between them.
  const first = rows[skip];
  const last = rows[rows.length - 1];
  const start = first.index ?? 0;
  const end = (last.index ?? 0) + last[0].length;

  return (
    content.slice(0, start) +
    open +
    content.slice(start, end) +
    LOOP_CLOSE +
    content.slice(end)
  );
}

/**
 * Splits rows into the header block and the looped body block.
 *
 * The stacked `table-cell-operations` branch holds a cell matrix, not an
 * HTML string. This keeps the merge to one call site change.
 *
 * @param rows - Every row, in display order.
 * @param headerRows - The count of leading rows to keep out of the loop.
 */
export function splitLoopRows<T>(
  rows: T[],
  headerRows?: number,
): { header: T[]; body: T[] } {
  const list = Array.isArray(rows) ? rows : [];
  const skip = Math.min(Math.max(headerRows ?? 0, 0), list.length);

  return { header: list.slice(0, skip), body: list.slice(skip) };
}
