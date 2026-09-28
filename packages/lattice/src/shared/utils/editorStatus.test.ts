import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => vi.stubGlobal("t", (value: string) => value));

import { getBlockActionMessage } from "./editorStatus";

describe("getBlockActionMessage", () => {
  it("creates one short result message", () => {
    expect(getBlockActionMessage("added", "Text")).toBe("Text added.");
    expect(getBlockActionMessage("moved", "Section")).toBe("Section moved.");
  });
});
