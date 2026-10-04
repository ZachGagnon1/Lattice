// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { blockDefinitions } from "@/domain/blocks";
import { Page } from "@/domain/blocks/definitions/Page";
import { Section } from "@/domain/blocks/definitions/Section";
import { Column } from "@/domain/blocks/definitions/Column";
import { Text } from "@/domain/blocks/definitions/Text";
import { Image } from "@/domain/blocks/definitions/Image";
import { IEmailTemplate } from "@/shared/typings";
import { getIdxAfterRemoval, resolveMoveTarget } from "./resolveMoveTarget";

beforeAll(() => {
  BlockManager.registerBlocks(blockDefinitions);
});

const TEXT_A = "content.children.[0].children.[0].children.[0]";
const TEXT_B = "content.children.[0].children.[0].children.[1]";
const COLUMN_B = "content.children.[1].children.[0]";
const IMAGE_B = "content.children.[1].children.[0].children.[0]";
const SECTION_A = "content.children.[0]";
const SECTION_B = "content.children.[1]";
const COLUMN_A = "content.children.[0].children.[0]";

function buildValues() {
  const page = {
    ...Page.create(),
    children: [
      {
        ...Section.create(),
        children: [
          {
            ...Column.create(),
            children: [Text.create(), Text.create()],
          },
        ],
      },
      {
        ...Section.create(),
        children: [
          {
            ...Column.create(),
            children: [Image.create()],
          },
        ],
      },
    ],
  };

  return { subject: "", subTitle: "", content: page } as IEmailTemplate;
}

describe("resolveMoveTarget", () => {
  it("moves the first text after the second text", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_A,
        targetIdx: TEXT_B,
        placement: "after",
      }),
    ).toEqual(TEXT_B);
  });

  it("moves the second text before the first text", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_B,
        targetIdx: TEXT_A,
        placement: "before",
      }),
    ).toEqual(TEXT_A);
  });

  it("returns null when moving the first text before the second text", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_A,
        targetIdx: TEXT_B,
        placement: "before",
      }),
    ).toBeNull();
  });

  it("moves the first text before the image", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_A,
        targetIdx: IMAGE_B,
        placement: "before",
      }),
    ).toEqual(IMAGE_B);
  });

  it("moves the first text inside the column of section B", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_A,
        targetIdx: COLUMN_B,
        placement: "inside",
      }),
    ).toEqual("content.children.[1].children.[0].children.[1]");
  });

  it("returns null when moving the first text inside the image", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: TEXT_A,
        targetIdx: IMAGE_B,
        placement: "inside",
      }),
    ).toBeNull();
  });

  it("returns null when moving section A inside its own column", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: SECTION_A,
        targetIdx: COLUMN_A,
        placement: "inside",
      }),
    ).toBeNull();
  });

  it("moves section A after section B", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: SECTION_A,
        targetIdx: SECTION_B,
        placement: "after",
      }),
    ).toEqual("content.children.[1]");
  });

  it("returns null when moving section B before the first text", () => {
    expect(
      resolveMoveTarget({
        values: buildValues(),
        sourceIdx: SECTION_B,
        targetIdx: TEXT_A,
        placement: "before",
      }),
    ).toBeNull();
  });
});

describe("getIdxAfterRemoval", () => {
  it("shifts a deeper sibling back by one place", () => {
    expect(
      getIdxAfterRemoval(
        "content.children.[2].children.[0]",
        "content.children.[0]",
      ),
    ).toEqual("content.children.[1].children.[0]");
  });

  it("returns the index unchanged when it is before the removed sibling", () => {
    expect(
      getIdxAfterRemoval(
        "content.children.[0].children.[3]",
        "content.children.[1]",
      ),
    ).toEqual("content.children.[0].children.[3]");
  });

  it("shifts a multi-digit sibling back by one place", () => {
    expect(
      getIdxAfterRemoval("content.children.[12]", "content.children.[3]"),
    ).toEqual("content.children.[11]");
  });
});
