import { describe, expect, it } from "vitest";
import {
  getTableBlockPath,
  getTableCellTarget,
  isTableSourceCellPath,
} from "./tableKeyboard";

describe("getTableCellTarget", () => {
  it("moves between table cells", () => {
    expect(getTableCellTarget(1, 1, "ArrowUp", [3, 3])).toEqual({
      row: 0,
      column: 1,
    });
    expect(getTableCellTarget(0, 1, "ArrowRight", [3, 3])).toEqual({
      row: 0,
      column: 2,
    });
  });

  it("stops at a table edge", () => {
    expect(getTableCellTarget(0, 0, "ArrowUp", [2])).toBeNull();
    expect(getTableCellTarget(0, 1, "ArrowRight", [2])).toBeNull();
  });
});

describe("isTableSourceCellPath", () => {
  it("keeps controls out of ordinary layout tables", () => {
    expect(
      isTableSourceCellPath(
        "content.children.0.data.value.tableSource.0.1.content",
      ),
    ).toBe(true);
    expect(isTableSourceCellPath("content.children.0.data.value.content")).toBe(
      false,
    );
    expect(
      getTableBlockPath(
        "content.children.0.data.value.tableSource.0.1.content",
      ),
    ).toBe("content.children.0");
  });
});
