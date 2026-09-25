// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import mjml from "mjml-browser";
import { BasicType } from "@/core/constants";
import { BlockManager } from "@/core/utils";
import { JsonToMjml } from "@/core/utils/JsonToMjml";
import { standardBlocks } from "@/core/blocks";
import { Condition } from "./Condition";
import { ForLoop } from "./ForLoop";
import { Page } from "./Page";
import { Wrapper } from "./Wrapper";
import { Section } from "./Section";
import { Column } from "./Column";
import { Text } from "./Text";

const TYPE_CLASS: Record<string, string> = {
  [BasicType.CONDITION]: "node-type-condition",
  [BasicType.FOR_LOOP]: "node-type-for-loop",
};

// The circular import leaves the block map empty, so the test registers
// every block.
beforeAll(() => {
  BlockManager.registerBlocks(standardBlocks);
});

const CONFIG: Record<string, any> = {
  [BasicType.CONDITION]: {
    rulesTree: {
      logicalOperator: "AND",
      rules: [
        { fieldId: "age", comparisonOperator: "GREATER_THAN", value: "18" },
      ],
    },
  },
  [BasicType.FOR_LOOP]: { dataSource: "products", itemAs: "product" },
};

const sectionWith = (content: string) => ({
  ...Section.create(),
  children: [
    {
      ...Column.create(),
      children: [Text.create({ data: { value: { content } } })],
    },
  ],
});

// A Condition holds its Sections in its branches. A ForLoop holds them directly.
function holding(block: any, sections: any[], elseSections: any[] = []) {
  const tree = block.create();
  if (block.type !== BasicType.CONDITION)
    return { ...tree, children: sections };
  const [ifBranch, elseBranch] = tree.children;
  return {
    ...tree,
    children: [
      { ...ifBranch, children: sections },
      { ...elseBranch, children: elseSections },
    ],
  };
}

function logicBlock(block: any) {
  return holding(block, [sectionWith("Hello")]);
}

const configured = (block: any) => {
  const tree = logicBlock(block);
  return { ...tree, data: { ...tree.data, value: CONFIG[block.type] } };
};

function inParent(parentType: string, child: any) {
  if (parentType === BasicType.PAGE) {
    return { ...Page.create(), children: [child] };
  }
  if (parentType === BasicType.WRAPPER) {
    return {
      ...Page.create(),
      children: [{ ...Wrapper.create(), children: [child] }],
    };
  }
  throw new Error("no tree for parent " + parentType);
}

async function compile(page: any, mode: "testing" | "production") {
  const mjmlString = JsonToMjml({
    data: page,
    idx: "content",
    context: page,
    mode,
  });
  const result: any = await mjml(mjmlString, {
    validationLevel: "soft",
  } as any);
  const errors: string[] = (result.errors || []).map(
    (e: any) => e.formattedMessage,
  );
  return { errors, html: result.html };
}

const parse = (html: string) =>
  new DOMParser().parseFromString(html, "text/html");

describe.each([
  ["Condition", Condition],
  ["ForLoop", ForLoop],
])("%s in real MJML", (_name, block) => {
  // The block renders an mj-wrapper in testing mode, and MJML rejects a
  // nested mj-wrapper. So a WRAPPER parent must never return.
  it("compiles without errors in every parent it allows", async () => {
    for (const parentType of block.validParentType) {
      const { errors } = await compile(
        inParent(parentType, logicBlock(block)),
        "testing",
      );
      expect(errors, parentType).toEqual([]);
    }
  });
  it("compiles without errors in production mode", async () => {
    for (const parentType of block.validParentType) {
      const { errors, html } = await compile(
        inParent(parentType, configured(block)),
        "production",
      );
      expect(errors, parentType).toEqual([]);
      expect(html).toMatch(/\{\{#(if|each) /);
    }
  });

  // The editor finds the logic block of a child by DOM ancestry, so the child
  // element must be inside the logic block element.
  it("renders its content inside its own element", async () => {
    const { html } = await compile(
      inParent(BasicType.PAGE, logicBlock(block)),
      "testing",
    );
    const text = parse(html).querySelector(".node-type-text");
    expect(text).not.toBeNull();
    expect(text!.closest("." + TYPE_CLASS[block.type])).not.toBeNull();
  });

  // Selection, typing, and drops all read these classes, and MJML drops them
  // outside a column.
  it("keeps the editor classes on every child block", async () => {
    const { html } = await compile(
      inParent(BasicType.PAGE, logicBlock(block)),
      "testing",
    );
    const children = parse(html).querySelectorAll(
      ".node-type-section, .node-type-column, .node-type-text",
    );
    expect(children.length).toBeGreaterThanOrEqual(3);
    for (const element of Array.from(children)) {
      expect(element.classList.contains("email-block")).toBe(true);
      expect(
        Array.from(element.classList).some((name) =>
          name.startsWith("node-idx-"),
        ),
      ).toBe(true);
    }
  });
  // A logic block must hold a real layout, such as two columns above one column.
  it("holds a two-column section above a one-column section", async () => {
    const column = () => ({
      ...Column.create(),
      children: [Text.create({ data: { value: { content: "Hello" } } })],
    });
    const tree = holding(block, [
      { ...Section.create(), children: [column(), column()] },
      { ...Section.create(), children: [column()] },
    ]);
    const { errors, html } = await compile(
      inParent(BasicType.PAGE, tree),
      "testing",
    );
    expect(errors).toEqual([]);
    const logic = parse(html).querySelector("." + TYPE_CLASS[block.type]);
    expect(logic).not.toBeNull();
    expect(logic!.querySelectorAll(".node-type-column")).toHaveLength(3);
  });
  // The template engine shows or hides only the content between the tags.
  it("puts the content between the open and close tags in production", async () => {
    const { html } = await compile(
      inParent(BasicType.PAGE, configured(block)),
      "production",
    );
    const open = html.search(/\{\{#(if|each) /);
    const content = html.indexOf("Hello");
    const close = html.search(/\{\{\/(if|each)\}\}/);
    expect(open).toBeGreaterThan(-1);
    expect(open).toBeLessThan(content);
    expect(content).toBeLessThan(close);
  });
});

describe("Condition else branch in real MJML", () => {
  const withElse = (elseSections: any[]) => {
    const tree = holding(Condition, [sectionWith("Hello")], elseSections);
    return {
      ...tree,
      data: { ...tree.data, value: CONFIG[BasicType.CONDITION] },
    };
  };

  it("compiles both branches without errors in the editor", async () => {
    const { errors, html } = await compile(
      inParent(BasicType.PAGE, withElse([sectionWith("Bye")])),
      "testing",
    );
    expect(errors).toEqual([]);
    const document = parse(html);
    const branches = document.querySelectorAll(".node-type-condition-branch");
    expect(branches).toHaveLength(1);
    expect(branches[0].textContent).toContain("ELSE");
    const texts = Array.from(document.querySelectorAll(".node-type-text"));
    expect(texts.map((text) => text.textContent?.trim())).toEqual([
      "Hello",
      "Bye",
    ]);
    for (const text of texts) {
      expect(text.closest(".node-type-condition")).not.toBeNull();
    }
  });

  // The else strip is the only drop target of an empty else branch.
  it("gives an empty else branch a drop target with its own classes", async () => {
    const { html } = await compile(
      inParent(BasicType.PAGE, withElse([])),
      "testing",
    );
    const strip = parse(html).querySelector(".node-type-condition-branch");
    expect(strip?.textContent).toContain("ELSE: Drop a Section block here");
    expect(strip?.classList.contains("email-block")).toBe(true);
    expect(
      Array.from(strip!.classList).some((name) =>
        name.endsWith(".children.[1]"),
      ),
    ).toBe(true);
  });

  it("puts the else content between the else and close tags", async () => {
    const { errors, html } = await compile(
      inParent(BasicType.PAGE, withElse([sectionWith("Bye")])),
      "production",
    );
    expect(errors).toEqual([]);
    const order = ["{{#if ", "Hello", "{{else}}", "Bye", "{{/if}}"].map(
      (needle) => html.indexOf(needle),
    );
    expect(order.every((index) => index > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("leaves out the else tag when the else branch is empty", async () => {
    const { html } = await compile(
      inParent(BasicType.PAGE, withElse([])),
      "production",
    );
    expect(html).toContain("{{#if ");
    expect(html).not.toContain("{{else}}");
  });

  it("shows only the if branch when no rule is set", async () => {
    const tree = holding(
      Condition,
      [sectionWith("Hello")],
      [sectionWith("Bye")],
    );
    const { html } = await compile(
      inParent(BasicType.PAGE, tree),
      "production",
    );
    expect(html).toContain("Hello");
    expect(html).not.toContain("Bye");
    expect(html).not.toContain("{{#if");
  });
});
