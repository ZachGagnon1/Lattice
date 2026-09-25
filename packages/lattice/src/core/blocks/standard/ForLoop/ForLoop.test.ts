import { beforeAll, describe, expect, it } from "vitest";

import { BasicType } from "@/core/constants";
import { ForLoop } from "./index";
import { BlockManager } from "@/core/utils";
import { Section } from "../Section";
import { Column } from "../Column";
import { JsonToMjml } from "@/core/utils/JsonToMjml";
import { compileLoopOpen, LOOP_CLOSE } from "@/core/utils/handlebars";

const LOOP = { dataSource: "products", itemAs: "product" };

const render = (data: any, mode: "production" | "testing") =>
  JsonToMjml({ data, mode, idx: "content.children.[0]" } as any);

const withValue = (value: any) => ({
  ...ForLoop.create(),
  data: { ...ForLoop.create().data, value },
});

const empty = () => ({ ...ForLoop.create(), children: [] });

// The circular import leaves the block map empty, so the test registers
// the blocks that it renders.
beforeAll(() => {
  BlockManager.registerBlocks({
    [ForLoop.type]: ForLoop,
    [Section.type]: Section,
    [Column.type]: Column,
  });
});

describe("ForLoop.create()", () => {
  it("stamps the default block with the for-loop type", () => {
    expect(ForLoop.create().type).toBe(BasicType.FOR_LOOP);
  });

  it("ships one Section child", () => {
    const block = ForLoop.create();

    expect(block.children).toHaveLength(1);
    expect(block.children![0].type).toBe(BasicType.SECTION);
  });

  it("ships a Section that holds one Column", () => {
    const section = ForLoop.create().children![0];

    expect(section.children).toHaveLength(1);
    expect(section.children![0].type).toBe(BasicType.COLUMN);
  });

  it("defaults the data source and the item alias to empty strings", () => {
    expect(ForLoop.create().data.value).toEqual({ dataSource: "", itemAs: "" });
  });

  it("lets a payload override the data source and the alias", () => {
    const block = ForLoop.create({ data: { value: LOOP } } as any);

    expect(block.data.value).toEqual(LOOP);
  });

  it("returns an independent block on every call", () => {
    const a = ForLoop.create();
    const b = ForLoop.create();

    a.children![0].children = [];

    expect(b.children![0].children).toHaveLength(1);
  });
});

describe("ForLoop.validParentType", () => {
  it("accepts a page as parent", () => {
    expect(ForLoop.validParentType).toContain(BasicType.PAGE);
    expect(ForLoop.validParentType).not.toContain(BasicType.WRAPPER);
  });

  it("refuses every other parent type", () => {
    expect(ForLoop.validParentType).toEqual([BasicType.PAGE]);
  });

  it("is admitted by a Section but not by a Column", () => {
    expect(Section.validParentType).toContain(BasicType.FOR_LOOP);
    expect(Column.validParentType).not.toContain(BasicType.FOR_LOOP);
  });
});

describe("ForLoop render in production mode", () => {
  it("renders nothing when the block has no children", () => {
    expect(render(empty(), "production")).toBe("");
  });

  it("renders the children with no handlebars tags when no loop is set", () => {
    const output = render(ForLoop.create(), "production");

    expect(output).toContain("<mj-section");
    expect(output).not.toContain("{{#each");
    expect(output).not.toContain("mj-raw");
  });

  it("wraps the children in a loop whose open and close match the compiler", () => {
    const output = render(withValue(LOOP), "production");
    const open = compileLoopOpen({
      source: LOOP.dataSource,
      itemAs: LOOP.itemAs,
    });

    expect(output).toContain(`<mj-raw>${open}</mj-raw>`);
    expect(output).toContain(`<mj-raw>${LOOP_CLOSE}</mj-raw>`);
  });

  it("opens the handlebars tag before the children and closes it after", () => {
    const output = render(withValue(LOOP), "production");

    expect(output.indexOf("{{#each")).toBeLessThan(
      output.indexOf("<mj-section"),
    );
    expect(output.indexOf("<mj-section")).toBeLessThan(
      output.indexOf("{{/each}}"),
    );
  });

  it("leaves no editor label and no coloured border in the output", () => {
    const output = render(withValue(LOOP), "production");

    expect(output).not.toContain("FOR EACH:");
    expect(output).not.toContain("#1976d2");
    expect(output).not.toContain("Drop a Section block here");
  });
});

describe("ForLoop render in testing mode", () => {
  it("renders a wrapper with the blue border", () => {
    const output = render(ForLoop.create(), "testing");

    expect(output).toContain("<mj-wrapper");
    expect(output).toContain("#1976d2");
  });

  it("shows the placeholder label when no data source is set", () => {
    const output = render(ForLoop.create(), "testing");

    expect(output).toContain("(no data source set)");
  });

  it("escapes the label text", () => {
    const output = render(
      withValue({ dataSource: "a>b", itemAs: "" }),
      "testing",
    );

    expect(output).toContain("&gt;");
    expect(output).not.toContain("a>b");
  });

  it("shows the drop placeholder when the block has no children", () => {
    const output = render(empty(), "testing");

    expect(output).toContain("Drop a Section block here");
  });

  it("renders the default Section and Column instead of the placeholder", () => {
    const output = render(ForLoop.create(), "testing");

    expect(output).not.toContain("Drop a Section block here");
    expect(output).toContain("node-type-section");
    expect(output).toContain("node-type-column");
  });

  it("emits no handlebars tags", () => {
    const output = render(withValue(LOOP), "testing");

    expect(output).not.toContain("{{#if");
    expect(output).not.toContain("{{#each");
  });
});
