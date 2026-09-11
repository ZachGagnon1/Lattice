/**
 * Helpers that turn user input into safe Handlebars literals and field paths.
 *
 * These are pure string functions. The condition and loop compilers use them
 * to build subexpressions such as `(eq user.[first-name] 'O\'Hara')`.
 */

/** A segment that Handlebars accepts without brackets. */
const IDENTIFIER_SEGMENT = /^[A-Za-z_$][\w$]*$/;

/** An array index segment, such as the `0` in `items.0.name`. */
const NUMERIC_SEGMENT = /^\d+$/;

/** One optional `{{ ... }}` wrapper around a whole field path. */
const MUSTACHE_WRAPPER = /^\{\{\s*([\s\S]*?)\s*\}\}$/;

/** Bare Handlebars literals that must stay unquoted. */
const BARE_KEYWORDS = ["true", "false", "null", "undefined"];

/**
 * Makes a value safe to place inside a single-quoted Handlebars literal.
 *
 * @param raw - Any value. `null` and `undefined` become an empty string.
 * @returns The escaped text, without the surrounding quotes.
 */
export function escapeHbsString(raw: unknown): string {
  const text = String(raw ?? "");

  // A Handlebars string literal cannot hold a line break, so collapse each
  // break to one space.
  const singleLine = text.replace(/\r\n|\r|\n/g, " ");

  // Escape the backslashes first, then the quotes. The order matters: it stops
  // the backslash of an escaped quote from being escaped a second time. It also
  // means a trailing backslash can never escape the closing quote, so nothing
  // has to be truncated and no input is lost.
  //
  // Note: `}}` needs no escape. Handlebars tokenises the string literal before
  // it looks for the closing braces, so `'a }} b'` stays one literal. Do not
  // "fix" this — an escape here reaches the output as visible backslashes.
  return singleLine.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Emits a Handlebars literal, unquoted where the value is canonical.
 *
 * `handlebars-helpers` compares with `===`, so `(eq age '18')` is false against
 * numeric data. Both `EQUALS` and `NOT_EQUALS` use this function for that
 * reason, not only the numeric comparisons.
 *
 * @param raw - The value the user typed.
 * @returns A bare keyword, a bare number, or a quoted string.
 */
export function toHbsLiteral(raw: string): string {
  const trimmed = String(raw ?? "").trim();

  if (BARE_KEYWORDS.includes(trimmed)) {
    return trimmed;
  }

  // Only a canonical number goes out bare. `String(Number(v)) === v` keeps
  // "18" as 18, and it keeps "01234" (a zip code) and "1e3" as strings,
  // because both round-trip to a different text.
  if (trimmed !== "" && String(Number(trimmed)) === trimmed) {
    return trimmed;
  }

  return `'${escapeHbsString(raw)}'`;
}

/**
 * Cleans a field path so that it can sit inside a subexpression.
 *
 * @param raw - The stored field id, such as `{{firstName}}` or `user.first-name`.
 * @returns A valid path such as `user.[first-name]`, or `""` for garbage input.
 */
export function normalizeFieldPath(raw: string): string {
  let text = String(raw ?? "").trim();

  // The old Condition field picker saved `{{firstName}}`, which produced the
  // invalid nested `{{#if (eq {{firstName}} 'John')}}`. Strip one wrapper.
  const wrapped = MUSTACHE_WRAPPER.exec(text);
  if (wrapped) {
    text = wrapped[1].trim();
  }

  const segments = text
    .split(".")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      if (IDENTIFIER_SEGMENT.test(segment) || NUMERIC_SEGMENT.test(segment)) {
        return segment;
      }
      // Hyphenated merge tags such as `first-name` parse as a subtraction, so
      // bracket-quote them. Brackets inside the segment would close the quote.
      return `[${segment.replace(/[[\]]/g, "")}]`;
    })
    .filter((segment) => segment !== "[]");

  return segments.join(".");
}

/**
 * Reports an empty value. The compiler uses it to flag `(gt age )`.
 *
 * @param raw - The value of a rule.
 * @returns `true` when the trimmed value is empty.
 */
export function isBlankValue(raw: string | undefined): boolean {
  return String(raw ?? "").trim() === "";
}
