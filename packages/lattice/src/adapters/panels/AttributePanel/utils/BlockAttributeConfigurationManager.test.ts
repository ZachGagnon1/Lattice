import { describe, expect, it, vi } from "vitest";

const { textConfig } = vi.hoisted(() => ({
  textConfig: () => null,
}));

vi.mock("../components/blocks", () => ({
  blocks: { text: textConfig },
}));

vi.mock("@/core/utils/BlockManager", () => ({
  BlockManager: {
    toBasicType: (type: string) => type.replace(/^advanced_/, ""),
  },
}));

import { BlockAttributeConfigurationManager } from "./BlockAttributeConfigurationManager";

describe("BlockAttributeConfigurationManager", () => {
  it("uses the basic config for a legacy advanced type", () => {
    const basicConfig = BlockAttributeConfigurationManager.get("text");

    expect(BlockAttributeConfigurationManager.get("advanced_text")).toBe(
      basicConfig,
    );
  });

  it("keeps an exact custom type that starts with advanced_", () => {
    const customConfig = () => null;
    BlockAttributeConfigurationManager.add({
      advanced_custom: customConfig,
    });

    expect(BlockAttributeConfigurationManager.get("advanced_custom")).toBe(
      customConfig,
    );
  });
});
