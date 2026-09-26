// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from "vitest";
import { BasicType } from "@/domain/constants";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { blockDefinitions } from "@/domain/blocks";
import { Page } from "@/domain/blocks/definitions/Page";
import { Section } from "@/domain/blocks/definitions/Section";
import { Column } from "@/domain/blocks/definitions/Column";
import { Text } from "@/domain/blocks/definitions/Text";
import { Image } from "@/domain/blocks/definitions/Image";
import { IEmailTemplate } from "@/shared/typings";
import { resolveAddTarget } from "./resolveAddTarget";

// The circular import leaves the block map empty, so the test registers every block.
beforeAll(() => {
  BlockManager.registerBlocks(blockDefinitions);
});

const COLUMN_IDX = "content.children.[0].children.[0]";
const TEXT_IDX = "content.children.[0].children.[0].children.[0]";
const SECTION_IDX = "content.children.[0]";
const PAGE_IDX = "content";

function buildValues() {
  const page = {
    ...Page.create(),
    children: [
      {
        ...Section.create(),
        children: [
          {
            ...Column.create(),
            children: [Text.create(), Image.create()],
          },
        ],
      },
    ],
  };

  return { subject: "", subTitle: "", content: page } as IEmailTemplate;
}

describe("resolveAddTarget", () => {
  it("adds the Text inside the focused Column", () => {
    expect(
      resolveAddTarget({
        type: BasicType.TEXT,
        focusIdx: COLUMN_IDX,
        values: buildValues(),
        autoComplete: false,
      }),
    ).toEqual({ parentIdx: COLUMN_IDX, positionIndex: 2 });
  });

  it("adds the Text after the focused Text", () => {
    expect(
      resolveAddTarget({
        type: BasicType.TEXT,
        focusIdx: TEXT_IDX,
        values: buildValues(),
        autoComplete: false,
      }),
    ).toEqual({ parentIdx: COLUMN_IDX, positionIndex: 1 });
  });

  it("adds the Section after the focused Section", () => {
    expect(
      resolveAddTarget({
        type: BasicType.SECTION,
        focusIdx: SECTION_IDX,
        values: buildValues(),
        autoComplete: false,
      }),
    ).toEqual({ parentIdx: "content", positionIndex: 1 });
  });

  it("returns null for the Text inside the focused Section without the auto-complete", () => {
    expect(
      resolveAddTarget({
        type: BasicType.TEXT,
        focusIdx: SECTION_IDX,
        values: buildValues(),
        autoComplete: false,
      }),
    ).toBeNull();
  });

  it("adds the Text after the focused Section with the auto-complete", () => {
    expect(
      resolveAddTarget({
        type: BasicType.TEXT,
        focusIdx: SECTION_IDX,
        values: buildValues(),
        autoComplete: true,
      }),
    ).toEqual({ parentIdx: "content", positionIndex: 1 });
  });

  it("adds the Text inside the focused Page with the auto-complete", () => {
    expect(
      resolveAddTarget({
        type: BasicType.TEXT,
        focusIdx: PAGE_IDX,
        values: buildValues(),
        autoComplete: true,
      }),
    ).toEqual({ parentIdx: "content", positionIndex: 1 });
  });

  it("returns null for the unknown type", () => {
    expect(
      resolveAddTarget({
        type: "nope",
        focusIdx: SECTION_IDX,
        values: buildValues(),
        autoComplete: true,
      }),
    ).toBeNull();
  });
});
