import { describe, expect, it } from "vitest";

import { compileCondition } from "./compileCondition";
import {
  ComparisonOperator,
  IConditionGroup,
  IConditionRule,
  LogicalOperator,
} from "./types";

/** Builds one leaf rule. */
const rule = (
  fieldId: string,
  comparisonOperator: ComparisonOperator | "",
  value = "",
): IConditionRule => ({ fieldId, comparisonOperator, value });

/** Builds one group. */
const group = (
  logicalOperator: LogicalOperator,
  rules: Array<IConditionRule | IConditionGroup>,
): IConditionGroup => ({ logicalOperator, rules });

describe("compileCondition single rule operators", () => {
  it("compiles EQUALS", () => {
    const result = compileCondition(
      group("AND", [rule("firstName", "EQUALS", "John")]),
    );

    expect(result.expression).toBe("(eq firstName 'John')");
    expect(result.label).toBe('firstName equals "John"');
    expect(result.issues).toEqual([]);
  });

  it("compiles NOT_EQUALS", () => {
    const result = compileCondition(
      group("AND", [rule("status", "NOT_EQUALS", "active")]),
    );

    // handlebars-helpers has no `ne` helper, and its `isnt` compares with
    // `!=` while `eq` compares with `===`. `(not (eq ...))` is the exact
    // negation of EQUALS and needs only helpers that certainly exist.
    expect(result.expression).toBe("(not (eq status 'active'))");
    expect(result.label).toBe('status not equals "active"');
  });

  it("compiles CONTAINS", () => {
    const result = compileCondition(
      group("AND", [rule("tags", "CONTAINS", "vip")]),
    );

    expect(result.expression).toBe("(contains tags 'vip')");
    expect(result.label).toBe('tags contains "vip"');
  });

  it("compiles GREATER_THAN with a bare number", () => {
    const result = compileCondition(
      group("AND", [rule("age", "GREATER_THAN", "18")]),
    );

    expect(result.expression).toBe("(gt age 18)");
    expect(result.label).toBe("age > 18");
  });

  it("compiles LESS_THAN with a bare number", () => {
    const result = compileCondition(
      group("AND", [rule("age", "LESS_THAN", "65")]),
    );

    expect(result.expression).toBe("(lt age 65)");
    expect(result.label).toBe("age < 65");
  });

  it("compiles IS_EMPTY as a not subexpression", () => {
    const result = compileCondition(
      group("AND", [rule("nickname", "IS_EMPTY")]),
    );

    expect(result.expression).toBe("(not nickname)");
    expect(result.label).toBe("nickname is empty");
  });

  it("compiles IS_NOT_EMPTY as a bare path with no parentheses", () => {
    const result = compileCondition(
      group("AND", [rule("nickname", "IS_NOT_EMPTY")]),
    );

    expect(result.expression).toBe("nickname");
    expect(result.expression).not.toContain("(");
    expect(result.expression).not.toContain(")");
    expect(result.label).toBe("nickname is not empty");
  });

  it("keeps IS_EMPTY valid when the value is empty", () => {
    const result = compileCondition(
      group("AND", [rule("nickname", "IS_EMPTY", "")]),
    );

    expect(result.expression).toBe("(not nickname)");
    expect(result.issues).toEqual([]);
  });
});

describe("compileCondition grouping", () => {
  it("passes a single child through without wrapping parentheses", () => {
    const result = compileCondition(
      group("AND", [rule("firstName", "EQUALS", "John")]),
    );

    expect(result.expression).toBe("(eq firstName 'John')");
    expect(result.expression.startsWith("(and")).toBe(false);
    expect(result.label).toBe('firstName equals "John"');
  });

  it("joins two children with and", () => {
    const result = compileCondition(
      group("AND", [
        rule("firstName", "EQUALS", "John"),
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(and (eq firstName 'John') (gt age 18))");
    expect(result.label).toBe('(firstName equals "John" AND age > 18)');
  });

  it("joins two children with or", () => {
    const result = compileCondition(
      group("OR", [
        rule("firstName", "EQUALS", "John"),
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(or (eq firstName 'John') (gt age 18))");
    expect(result.label).toBe('(firstName equals "John" OR age > 18)');
  });

  it("lets the root group operator drive the join", () => {
    // The attribute panel cannot set the root operator today. The compiler
    // contract still has to honour it.
    const result = compileCondition(
      group("OR", [rule("a", "IS_NOT_EMPTY"), rule("b", "IS_NOT_EMPTY")]),
    );

    expect(result.expression).toBe("(or a b)");
  });

  it("compiles a nested group inside the root group", () => {
    const result = compileCondition(
      group("AND", [
        rule("country", "EQUALS", "US"),
        group("OR", [
          rule("age", "GREATER_THAN", "18"),
          rule("guardian", "IS_NOT_EMPTY"),
        ]),
      ]),
    );

    expect(result.expression).toBe(
      "(and (eq country 'US') (or (gt age 18) guardian))",
    );
    expect(result.label).toBe(
      '(country equals "US" AND (age > 18 OR guardian is not empty))',
    );
  });

  it("reports the dotted path of a node inside a nested group", () => {
    const result = compileCondition(
      group("AND", [
        rule("country", "EQUALS", "US"),
        group("OR", [
          rule("", "EQUALS", "x"),
          rule("age", "GREATER_THAN", "18"),
        ]),
      ]),
    );

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].path).toBe("rules.1.rules.0");
    expect(result.issues[0].code).toBe("MISSING_FIELD");
  });
});

describe("compileCondition ruleCount", () => {
  it("counts every leaf rule, valid or not", () => {
    const result = compileCondition(
      group("AND", [
        rule("a", "IS_NOT_EMPTY"),
        rule("", "EQUALS", "x"),
        rule("c", ""),
      ]),
    );

    expect(result.ruleCount).toBe(3);
  });

  it("does not count a group as a rule", () => {
    const result = compileCondition(
      group("AND", [
        rule("a", "IS_NOT_EMPTY"),
        group("OR", [rule("b", "IS_NOT_EMPTY"), rule("c", "IS_NOT_EMPTY")]),
      ]),
    );

    expect(result.ruleCount).toBe(3);
  });
});

describe("compileCondition invalid rules", () => {
  it("reports MISSING_FIELD and excludes the rule", () => {
    const result = compileCondition(
      group("AND", [
        rule("", "EQUALS", "John"),
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(gt age 18)");
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe("MISSING_FIELD");
    expect(result.issues[0].path).toBe("rules.0");
  });

  it("reports MISSING_OPERATOR and excludes the rule", () => {
    const result = compileCondition(
      group("AND", [
        rule("firstName", "", "John"),
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(gt age 18)");
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe("MISSING_OPERATOR");
    expect(result.issues[0].path).toBe("rules.0");
  });

  it("reports UNKNOWN_OPERATOR and excludes the rule", () => {
    const result = compileCondition(
      group("AND", [
        rule("firstName", "BETWEEN" as ComparisonOperator, "John"),
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(gt age 18)");
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe("UNKNOWN_OPERATOR");
    expect(result.issues[0].path).toBe("rules.0");
  });

  it("never emits a bare field for an unknown operator", () => {
    // The old compiler had a `default:` branch that returned the bare field
    // id, so a malformed operator became a silent `{{#if firstName}}`.
    const result = compileCondition(
      group("AND", [
        rule("firstName", "BETWEEN" as ComparisonOperator, "John"),
      ]),
    );

    expect(result.expression).toBe("");
    expect(result.expression).not.toContain("firstName");
    expect(result.issues.map((issue) => issue.code)).toContain(
      "UNKNOWN_OPERATOR",
    );
  });

  it("excludes GREATER_THAN when the value is empty", () => {
    const result = compileCondition(
      group("AND", [rule("age", "GREATER_THAN", "")]),
    );

    expect(result.expression).toBe("");
    expect(result.expression).not.toContain("gt");
    expect(result.issues.map((issue) => issue.code)).toContain("MISSING_VALUE");
  });

  it("excludes a rule whose value is only whitespace", () => {
    const result = compileCondition(
      group("AND", [rule("age", "GREATER_THAN", "   ")]),
    );

    expect(result.expression).toBe("");
    expect(result.issues[0].code).toBe("MISSING_VALUE");
    expect(result.issues[0].path).toBe("rules.0");
  });
});

describe("compileCondition legacy field ids", () => {
  it("compiles a wrapped field id without nesting mustaches", () => {
    const result = compileCondition(
      group("AND", [rule("{{firstName}}", "EQUALS", "John")]),
    );

    expect(result.expression).toBe("(eq firstName 'John')");
    expect(result.expression).not.toContain("{{");
    expect(result.expression).not.toContain("}}");
  });

  it("compiles a wrapped hyphenated field id", () => {
    const result = compileCondition(
      group("AND", [rule("{{ user.first-name }}", "IS_NOT_EMPTY")]),
    );

    expect(result.expression).toBe("user.[first-name]");
    expect(result.expression).not.toContain("{{");
  });
});

describe("compileCondition robustness", () => {
  it("handles an undefined root", () => {
    const result = compileCondition(undefined);

    expect(result.expression).toBe("");
    expect(result.label).toBe("");
    expect(result.ruleCount).toBe(0);
    expect(result.issues[0].code).toBe("EMPTY_GROUP");
    expect(result.issues[0].path).toBe("");
  });

  it("handles an empty object as the root", () => {
    const result = compileCondition({} as IConditionGroup);

    expect(result.expression).toBe("");
    expect(result.issues[0].code).toBe("EMPTY_GROUP");
  });

  it("handles a root with no rules array", () => {
    const result = compileCondition({
      logicalOperator: "AND",
    } as IConditionGroup);

    expect(result.expression).toBe("");
    expect(result.issues[0].code).toBe("EMPTY_GROUP");
  });

  it("handles a root whose rules field is not an array", () => {
    const result = compileCondition({
      logicalOperator: "AND",
      rules: "nope",
    } as unknown as IConditionGroup);

    expect(result.expression).toBe("");
    expect(result.issues[0].code).toBe("EMPTY_GROUP");
  });

  it("handles an empty rules array", () => {
    const result = compileCondition(group("AND", []));

    expect(result.expression).toBe("");
    expect(result.ruleCount).toBe(0);
    expect(result.issues[0].code).toBe("EMPTY_GROUP");
  });

  it("handles a null child", () => {
    const result = compileCondition(
      group("AND", [
        null as unknown as IConditionRule,
        rule("age", "GREATER_THAN", "18"),
      ]),
    );

    expect(result.expression).toBe("(gt age 18)");
    expect(result.ruleCount).toBe(2);
    expect(result.issues[0].code).toBe("MISSING_FIELD");
    expect(result.issues[0].path).toBe("rules.0");
  });
});
