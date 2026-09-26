// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { standardBlocks } from "@/domain/blocks";
import { Condition } from "@/domain/blocks/standard/Condition";
import { Page } from "@/domain/blocks/standard/Page";
import { Section } from "@/domain/blocks/standard/Section";
import { Column } from "@/domain/blocks/standard/Column";
import { Text } from "@/domain/blocks/standard/Text";
import { renderToHtml } from "./handlebars";
import type { IEmailTemplate } from "@/shared/typings";

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
