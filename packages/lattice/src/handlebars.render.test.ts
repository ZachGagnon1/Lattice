// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { BlockManager } from "@/core/utils";
import { standardBlocks } from "@/core/blocks";
import { Condition } from "@/core/blocks/standard/Condition";
import { Page } from "@/core/blocks/standard/Page";
import { Section } from "@/core/blocks/standard/Section";
import { Column } from "@/core/blocks/standard/Column";
import { Text } from "@/core/blocks/standard/Text";
import { renderToHtml } from "./handlebars";
import type { IEmailTemplate } from "@/typings";

// The circular import leaves the block map empty, so the test registers
// every block.
beforeAll(() => {
  BlockManager.registerBlocks(standardBlocks);
});

const sectionWith = (content: string) => ({
  ...Section.create(),
  children: [
    {
      ...Column.create(),
      children: [Text.create({ data: { value: { content } } })],
    },
  ],
});

const tree = Condition.create();
const [ifBranch, elseBranch] = tree.children;
const condition: ReturnType<typeof Condition.create> = {
  ...tree,
  data: {
    ...tree.data,
    value: {
      rulesTree: {
        logicalOperator: "AND",
        rules: [
          { fieldId: "age", comparisonOperator: "GREATER_THAN", value: "18" },
        ],
      },
    },
  },
  children: [
    { ...ifBranch, children: [sectionWith("ADULT")] },
    { ...elseBranch, children: [sectionWith("MINOR")] },
  ],
};

const page = { ...Page.create(), children: [condition] };

const template = { subject: "", subTitle: "", content: page } as IEmailTemplate;

describe("renderToHtml", () => {
  it("renders the if branch when the rule matches", async () => {
    const html = await renderToHtml(template, { age: 20 });
    expect(html).toContain("ADULT");
    expect(html).not.toContain("MINOR");
  });

  it("renders the else branch when the rule does not match", async () => {
    const html = await renderToHtml(template, { age: 10 });
    expect(html).toContain("MINOR");
    expect(html).not.toContain("ADULT");
  });

  it("leaves no Handlebars expression in the output", async () => {
    const html = await renderToHtml(template, { age: 20 });
    expect(html).not.toContain("{{");
  });
});
