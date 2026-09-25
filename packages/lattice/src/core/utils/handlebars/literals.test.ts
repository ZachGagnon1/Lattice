import { describe, expect, it } from "vitest";

import {
  escapeHbsString,
  isBlankValue,
  normalizeFieldPath,
  toHbsLiteral,
} from "./literals";

describe("escapeHbsString", () => {
  it("turns null into an empty string", () => {
    expect(escapeHbsString(null)).toBe("");
  });

  it("turns undefined into an empty string", () => {
    expect(escapeHbsString(undefined)).toBe("");
  });

  it("collapses a line feed to one space", () => {
    expect(escapeHbsString("a\nb")).toBe("a b");
  });

  it("collapses a carriage return and line feed pair to one space", () => {
    expect(escapeHbsString("a\r\nb")).toBe("a b");
  });

  it("collapses a lone carriage return to one space", () => {
    expect(escapeHbsString("a\rb")).toBe("a b");
  });

  it("escapes a single quote", () => {
    expect(escapeHbsString("O'Hara")).toBe("O\\'Hara");
  });

  it("doubles a backslash", () => {
    expect(escapeHbsString("a\\b")).toBe("a\\\\b");
  });

  it("preserves a trailing backslash as an escaped pair", () => {
    // The raw value is `C:\dir\`. The escaped value is `C:\\dir\\`.
    expect(escapeHbsString("C:\\dir\\")).toBe("C:\\\\dir\\\\");
  });

  it("produces a literal whose trailing backslash cannot escape the closing quote", () => {
    const literal = `'${escapeHbsString("C:\\dir\\")}'`;

    expect(literal).toBe("'C:\\\\dir\\\\'");

    // An even count of backslashes before the closing quote means each
    // backslash is escaped. So the quote still closes the literal.
    const trailingBackslashes = /(\\*)'$/.exec(literal);
    expect(trailingBackslashes).not.toBeNull();
    expect((trailingBackslashes as RegExpExecArray)[1].length % 2).toBe(0);
  });

  it("double escapes a backslash that comes before a quote", () => {
    // The raw value is `\'`. The escaped value is `\\\'`.
    expect(escapeHbsString("\\'")).toBe("\\\\\\'");
  });

  it("leaves a closing mustache pair alone", () => {
    // Handlebars tokenises the string literal before it looks for `}}`.
    // An escape here reaches the output as visible backslashes.
    expect(escapeHbsString("a }} b")).toBe("a }} b");
  });
});

describe("toHbsLiteral", () => {
  it("emits a whole number bare", () => {
    expect(toHbsLiteral("18")).toBe("18");
  });

  it("emits a negative number bare", () => {
    expect(toHbsLiteral("-4")).toBe("-4");
  });

  it("emits zero bare", () => {
    expect(toHbsLiteral("0")).toBe("0");
  });

  it("emits a decimal number bare", () => {
    expect(toHbsLiteral("1.5")).toBe("1.5");
  });

  it("keeps a leading zero value quoted so a zip code stays a string", () => {
    expect(toHbsLiteral("01234")).toBe("'01234'");
  });

  it("keeps exponent notation quoted because it is not canonical", () => {
    expect(toHbsLiteral("1e3")).toBe("'1e3'");
  });

  it("trims a number before it decides the form", () => {
    expect(toHbsLiteral("  18  ")).toBe("18");
  });

  it("emits true bare", () => {
    expect(toHbsLiteral("true")).toBe("true");
  });

  it("emits false bare", () => {
    expect(toHbsLiteral("false")).toBe("false");
  });

  it("emits null bare", () => {
    expect(toHbsLiteral("null")).toBe("null");
  });

  it("emits undefined bare", () => {
    expect(toHbsLiteral("undefined")).toBe("undefined");
  });

  it("emits an empty value as an empty quoted literal", () => {
    expect(toHbsLiteral("")).toBe("''");
  });

  it("escapes a quote inside a quoted literal", () => {
    expect(toHbsLiteral("O'Hara")).toBe("'O\\'Hara'");
  });

  it("never quotes a number, because the eq helper compares with strict equality", () => {
    // `handlebars-helpers` `eq` is `===`. A quoted `'18'` does not match the
    // numeric `18` in the data, so the number must stay bare.
    const literal = toHbsLiteral("18");

    expect(literal).not.toBe("'18'");
    expect(literal).not.toContain("'");
    expect(`(eq age ${literal})`).toBe("(eq age 18)");
  });
});

describe("toHbsLiteral number detection edge cases", () => {
  it("keeps Infinity quoted, because Handlebars has no Infinity literal", () => {
    // A bare `Infinity` lexes as a path. So `(eq x Infinity)` reads an
    // undefined field, not the text that the author typed.
    expect(toHbsLiteral("Infinity")).toBe("'Infinity'");
  });

  it("keeps NaN quoted, because Handlebars has no NaN literal", () => {
    expect(toHbsLiteral("NaN")).toBe("'NaN'");
  });

  it("keeps negative exponent notation quoted, the same as 1e3", () => {
    expect(toHbsLiteral("1e-7")).toBe("'1e-7'");
  });
});

describe("normalizeFieldPath", () => {
  it("strips a mustache wrapper", () => {
    expect(normalizeFieldPath("{{firstName}}")).toBe("firstName");
  });

  it("strips a mustache wrapper that holds spaces", () => {
    expect(normalizeFieldPath("{{ firstName }}")).toBe("firstName");
  });

  it("bracket quotes a hyphenated segment", () => {
    expect(normalizeFieldPath("user.first-name")).toBe("user.[first-name]");
  });

  it("passes a numeric segment through without brackets", () => {
    expect(normalizeFieldPath("items.0.name")).toBe("items.0.name");
  });

  it("returns an empty string for a blank path", () => {
    expect(normalizeFieldPath("   ")).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(normalizeFieldPath(undefined as unknown as string)).toBe("");
  });

  it("drops an empty segment", () => {
    expect(normalizeFieldPath("a..b")).toBe("a.b");
  });

  it("bracket quotes a segment that holds a space", () => {
    expect(normalizeFieldPath("first name")).toBe("[first name]");
  });
});

describe("isBlankValue", () => {
  it("reports an empty string as blank", () => {
    expect(isBlankValue("")).toBe(true);
  });

  it("reports a whitespace string as blank", () => {
    expect(isBlankValue("   ")).toBe(true);
  });

  it("reports undefined as blank", () => {
    expect(isBlankValue(undefined)).toBe(true);
  });

  it("reports the string zero as a real value", () => {
    expect(isBlankValue("0")).toBe(false);
  });
});
