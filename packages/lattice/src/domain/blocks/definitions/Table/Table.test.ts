import { describe, expect, it } from "vitest";
import { Table } from "./index";

describe("Table.create", () => {
  it("gives each block its own cells", () => {
    const a = Table.create();
    const b = Table.create();
    a.data.value.tableSource[0][0].content = "Changed";
    expect(b.data.value.tableSource[0][0].content).toBe("Header 1");
    const c = Table.create();
    expect(c.data.value.tableSource[0][0].content).toBe("Header 1");
  });

  it("replaces the default grid with a payload grid", () => {
    const block = Table.create({
      data: { value: { tableSource: [[{ content: "A" }, { content: "B" }]] } },
    });
    expect(block.data.value.tableSource).toEqual([
      [{ content: "A" }, { content: "B" }],
    ]);
  });

  it("keeps the default header row count", () => {
    expect(Table.create().data.value.rowLoop?.headerRows).toBe(1);
  });
});
