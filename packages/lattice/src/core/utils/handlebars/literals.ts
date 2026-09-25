/**
 * These functions turn user input into safe Handlebars literals and field paths.
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
 * The form the Handlebars lexer accepts as a number.
 *
 * This pattern is narrower than `Number()`. Handlebars has no exponent form and
 * no `Infinity` or `NaN` literal.
 */
const NUMBER_LITERAL = /^-?\d+(\.\d+)?$/;

/**
 * Makes a value safe inside a single-quoted Handlebars literal.
 *
 * @param raw - `null` and `undefined` become an empty string.
 * @returns The escaped text without the surrounding quotes.
 */
export function escapeHbsString(raw: unknown): string {
  const text = String(raw ?? "");

  // A Handlebars string literal cannot hold a line break, so each break
  // becomes one space.
  const singleLine = text.replace(/\r\n|\r|\n/g, " ");

  // Escape the backslashes before the quotes. The order stops a double
  // escape. It also stops a trailing backslash from escaping the closing
  // quote, so no input is lost.
  //
  // `}}` needs no escape. Handlebars reads the string literal before it looks
  // for the closing braces. So `'a }} b'` stays one literal. Do not add an
  // escape here. It shows as visible backslashes in the output.
  return singleLine.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Emits a Handlebars literal. A canonical value stays unquoted.
 *
 * `handlebars-helpers` compares values with `===`. So `(eq age '18')` is false
 * against numeric data. Both `EQUALS` and `NOT_EQUALS` use this function for
 * that reason, not only for numeric comparisons.
 *
 * @param raw - The value the user typed.
 * @returns A bare keyword, a bare number, or a quoted string.
 */
export function toHbsLiteral(raw: string): string {
  const trimmed = String(raw ?? "").trim();

  if (BARE_KEYWORDS.includes(trimmed)) {
    return trimmed;
  }

  // Only a canonical number goes out bare. It must match the shape that the
  // Handlebars lexer reads as a NUMBER: `-?[0-9]+(\.[0-9]+)?`.
  //
  // The shape test is not redundant. A round-trip test alone lets "Infinity",
  // "NaN", and "1e-7" through. Handlebars does not read these as numbers.
  // It reads each one as a path lookup and resolves it to undefined.
  // The round-trip test keeps "01234" (a zip code) and "1.50" as strings,
  // because they round-trip to different text.
  if (NUMBER_LITERAL.test(trimmed) && String(Number(trimmed)) === trimmed) {
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

  // The old Condition field picker saved `{{firstName}}`. It produced the
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
      // Hyphenated merge tags such as `first-name` parse as a subtraction.
      // Bracket-quote them. A bracket inside the segment closes the quote.
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
