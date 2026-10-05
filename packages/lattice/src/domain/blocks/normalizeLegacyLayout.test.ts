// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import mjml from "mjml-browser";
import { BasicType } from "@/domain/constants";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { blockDefinitions } from "@/domain/blocks";
import { IBlockData } from "@/domain/typings";
import type { IPage } from "@/domain/blocks/definitions/Page";
import { exportToMjml } from "@/shared/utils/export";
import { normalizeLegacyLayout } from "./normalizeLegacyLayout";

beforeAll(() => {
  BlockManager.registerBlocks(blockDefinitions);
});

const make = (type: string, payload = {}): IBlockData =>
  BlockManager.getBlockByType(type)!.create(payload);

const pageWith = (...children: IBlockData[]): IPage => ({
  ...(make(BasicType.PAGE) as IPage),
  children,
});

function expectWrapped(result: IBlockData, inner: IBlockData) {
  expect(result.type).toBe(BasicType.SECTION);
  expect(result.attributes.padding).toBe("0px");
  expect(result.children).toHaveLength(1);
  expect(result.children[0].type).toBe(BasicType.COLUMN);
  expect(result.children[0].children).toEqual([inner]);
}

describe("normalizeLegacyLayout", () => {
  it("wraps a page-level advanced_text", () => {
    const text = make("advanced_text");
    const out = normalizeLegacyLayout(pageWith(text));
    expectWrapped(out.children[0], text);
  });

  it.each(["advanced_image", "advanced_divider"])(
    "wraps a page-level %s in its own section",
    (type) => {
      const a = make(type);
      const b = make("advanced_text");
      const out = normalizeLegacyLayout(pageWith(a, b));
      expect(out.children).toHaveLength(2);
      expectWrapped(out.children[0], a);
      expectWrapped(out.children[1], b);
    },
  );

  it("leaves a valid advanced_section alone", () => {
    const section = make("advanced_section");
    const page = pageWith(section);
    expect(normalizeLegacyLayout(page).children[0]).toBe(section);
  });

  it("wraps text inside a wrapper", () => {
    const text = make("advanced_text");
    const wrapper = { ...make(BasicType.WRAPPER), children: [text] };
    const out = normalizeLegacyLayout(pageWith(wrapper));
    expect(out.children[0].type).toBe(BasicType.WRAPPER);
    expectWrapped(out.children[0].children[0], text);
  });

  it("leaves an unknown type alone", () => {
    const unknown = { ...make(BasicType.TEXT), type: "mystery_block" };
    const page = pageWith(unknown);
    expect(normalizeLegacyLayout(page)).toBe(page);
  });

  it("returns the same reference when nothing changes", () => {
    const section = {
      ...make(BasicType.SECTION),
      children: [
        { ...make(BasicType.COLUMN), children: [make(BasicType.TEXT)] },
      ],
    };
    const wrapper = { ...make(BasicType.WRAPPER), children: [section] };
    const page = pageWith(section, wrapper);
    expect(normalizeLegacyLayout(page)).toBe(page);
  });

  it("does not mutate the input", () => {
    const page = pageWith(make("advanced_text"));
    const copy = structuredClone(page);
    normalizeLegacyLayout(page);
    expect(page).toEqual(copy);
  });

  it("exports a page-level text to MJML without errors", async () => {
    const text = make("advanced_text", {
      data: { value: { content: "Legacy hello" } },
    });
    const mjmlString = exportToMjml({
      subject: "s",
      subTitle: "t",
      content: pageWith(text),
    });
    const result: any = await mjml(mjmlString, {
      validationLevel: "soft",
    } as any);
    expect(result.html).toContain("Legacy hello");
    expect(result.errors ?? []).toEqual([]);
  });
});
