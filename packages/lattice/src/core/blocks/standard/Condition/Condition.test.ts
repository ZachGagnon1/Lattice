import { beforeAll, describe, expect, it } from "vitest";

import { BasicType } from "@/core/constants";
import { Condition } from "./index";
import { BlockManager } from "@/core/utils";
import { Section } from "../Section";
import { Column } from "../Column";
import { JsonToMjml } from "@/core/utils/JsonToMjml";
import { compileCondition } from "@/core/utils/handlebars";
import { IConditionGroup } from "@/core/utils/handlebars";

const RULE: IConditionGroup = {
  logicalOperator: "AND",
  rules: [{ fieldId: "age", comparisonOperator: "GREATER_THAN", value: "18" }],
};

const render = (data: any, mode: "production" | "testing") =>
  JsonToMjml({ data, mode, idx: "content.children.[0]" } as any);

const withValue = (value: any) => ({
  ...Condition.create(),
  data: { ...Condition.create().data, value },
});

const empty = () => ({ ...Condition.create(), children: [] });

// The circular import leaves the block map empty, so register the blocks we render.
beforeAll(() => {
  BlockManager.registerBlocks({
    [Condition.type]: Condition,
    [Section.type]: Section,
    [Column.type]: Column,
  });
});

describe("Condition.create()", () => {
  it("stamps the default block with the condition type", () => {
    expect(Condition.create().type).toBe(BasicType.CONDITION);
  });

  it("ships one Section child", () => {
    const block = Condition.create();

    expect(block.children).toHaveLength(1);
    expect(block.children![0].type).toBe(BasicType.SECTION);
  });

  it("ships a Section that holds one Column", () => {
    const section = Condition.create().children![0];

    expect(section.children).toHaveLength(1);
    expect(section.children![0].type).toBe(BasicType.COLUMN);
  });

  it("defaults the rules tree to an empty AND group", () => {
    expect(Condition.create().data.value.rulesTree).toEqual({
      logicalOperator: "AND",
      rules: [],
    });
  });

  it("lets a payload override the rules tree", () => {
    const block = Condition.create({
      data: { value: { rulesTree: RULE } },
    } as any);

    expect(block.data.value.rulesTree).toEqual(RULE);
  });

  it("returns an independent block on every call", () => {
    const a = Condition.create();
    const b = Condition.create();

    a.children![0].children = [];

    expect(b.children![0].children).toHaveLength(1);
  });
});

describe("Condition.validParentType", () => {
  it("accepts a page or a wrapper as parent", () => {
    expect(Condition.validParentType).toContain(BasicType.PAGE);
    expect(Condition.validParentType).toContain(BasicType.WRAPPER);
  });

  it("refuses every other parent type", () => {
    expect(Condition.validParentType).toEqual([
      BasicType.PAGE,
      BasicType.WRAPPER,
    ]);
  });

  it("is admitted by a Section but not by a Column", () => {
    expect(Section.validParentType).toContain(BasicType.CONDITION);
    expect(Column.validParentType).not.toContain(BasicType.CONDITION);
  });
});

describe("Condition render in production mode", () => {
  it("renders nothing when the block has no children", () => {
    expect(render(empty(), "production")).toBe("");
  });

  it("renders the children with no handlebars tags when no rule is set", () => {
    const output = render(
      withValue({ rulesTree: { logicalOperator: "AND", rules: [] } }),
      "production",
    );

    expect(output).toContain("<mj-section");
    expect(output).not.toContain("{{#if");
    expect(output).not.toContain("mj-raw");
  });

  it("wraps the children in an if block whose expression matches compileCondition", () => {
    const output = render(withValue({ rulesTree: RULE }), "production");
    const expression = compileCondition(RULE).expression;

    expect(output).toContain(`<mj-raw>{{#if ${expression}}}</mj-raw>`);
    expect(output).toContain("<mj-raw>{{/if}}</mj-raw>");
  });

  it("opens the handlebars tag before the children and closes it after", () => {
    const output = render(withValue({ rulesTree: RULE }), "production");

    expect(output.indexOf("{{#if")).toBeLessThan(output.indexOf("<mj-section"));
    expect(output.indexOf("<mj-section")).toBeLessThan(
      output.indexOf("{{/if}}"),
    );
  });

  it("leaves no editor label and no coloured border in the output", () => {
    const output = render(withValue({ rulesTree: RULE }), "production");

    expect(output).not.toContain("IF:");
    expect(output).not.toContain("#ff8c00");
    expect(output).not.toContain("Drop a Section block here");
  });
});

describe("Condition render in testing mode", () => {
  it("renders a wrapper with the orange border", () => {
    const output = render(
      withValue({ rulesTree: { logicalOperator: "AND", rules: [] } }),
      "testing",
    );

    expect(output).toContain("<mj-wrapper");
    expect(output).toContain("#ff8c00");
  });

  it("shows the placeholder label when no rule is set", () => {
    const output = render(
      withValue({ rulesTree: { logicalOperator: "AND", rules: [] } }),
      "testing",
    );

    expect(output).toContain("IF: (no condition set)");
  });

  it("escapes the label text", () => {
    const output = render(withValue({ rulesTree: RULE }), "testing");

    expect(output).toContain("&gt;");
    expect(output).not.toContain("age > 18");
  });

  it("shows the drop placeholder when the block has no children", () => {
    const output = render(empty(), "testing");

    expect(output).toContain("Drop a Section block here");
  });

  it("renders the default Section and Column instead of the placeholder", () => {
    const output = render(Condition.create(), "testing");

    expect(output).not.toContain("Drop a Section block here");
    expect(output).toContain("node-type-section");
    expect(output).toContain("node-type-column");
  });

  it("emits no handlebars tags", () => {
    const output = render(withValue({ rulesTree: RULE }), "testing");

    expect(output).not.toContain("{{#if");
    expect(output).not.toContain("{{#each");
  });
});
