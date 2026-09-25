// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { htmlToTableSource, tableSourceToHtml } from "./tableSource";
import type { ITableCellData } from "./index";

describe("tableSource", () => {
  it("round-trips a grid with spans", () => {
    const grid: ITableCellData[][] = [
      [{ content: "A", colSpan: 2 }],
      [{ content: "B" }, { content: "<b>C</b>", rowSpan: 2 }],
    ];
    expect(
      htmlToTableSource(tableSourceToHtml(grid, { cellPadding: "8px" })),
    ).toEqual(grid);
  });

  it("keeps a cell background color", () => {
    expect(
      htmlToTableSource('<tr><td style="background-color: red">X</td></tr>'),
    ).toEqual([[{ content: "X", backgroundColor: "red" }]]);
  });

  it("reads rows from a full table", () => {
    expect(
      htmlToTableSource("<table><tbody><tr><td>X</td></tr></tbody></table>"),
    ).toEqual([[{ content: "X" }]]);
  });

  it("ignores the rows of a nested table", () => {
    const result = htmlToTableSource(
      "<tr><td><table><tr><td>inner</td></tr></table></td></tr>",
    );
    expect(result).toHaveLength(1);
    expect(result[0][0].content).toContain("<table>");
  });
});
