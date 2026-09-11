import { describe, expect, it } from "vitest";

import { BasicType } from "@/core/constants";

describe("test setup smoke check", () => {
  it("resolves the @ path alias", () => {
    expect(BasicType.CONDITION).toBe("condition");
  });
});
