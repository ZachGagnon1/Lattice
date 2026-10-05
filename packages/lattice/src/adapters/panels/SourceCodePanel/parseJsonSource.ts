import { BasicType } from "@/domain/constants";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { getPageIdx } from "@/domain/blocks/block";
import { normalizeLegacyLayout } from "@/domain/blocks/normalizeLegacyLayout";
import type { IPage } from "@/domain/blocks";
import type { IBlockData } from "@/domain/typings";
import { t } from "@/shared/utils/I18nManager";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Parses the "Json source" text into a block. Throws an Error with a user message. */
export function parseJsonSource(text: string, focusIdx: string): IBlockData {
  // eval accepts JS object literals, which JSON.parse rejects.
  const raw: unknown = JSON.parse(
    JSON.stringify(window.eval("(" + text + ")")),
  );
  let value = raw;

  // The user can paste a whole template. Only the page can hold its content.
  if (
    isRecord(value) &&
    typeof value.type !== "string" &&
    isRecord(value.content)
  ) {
    if (focusIdx !== getPageIdx()) throw new Error(t("Invalid content"));
    value = value.content;
  }

  if (!isRecord(value) || typeof value.type !== "string") {
    throw new Error(t("Invalid content"));
  }
  const block = value as unknown as IBlockData;

  if (!BlockManager.getBlockByType(block.type)) {
    throw new Error(t("Invalid content"));
  }

  if (
    !block.data?.value ||
    !block.attributes ||
    !Array.isArray(block.children)
  ) {
    throw new Error(t("Invalid content format"));
  }

  return block.type === BasicType.PAGE
    ? normalizeLegacyLayout(block as IPage)
    : block;
}
